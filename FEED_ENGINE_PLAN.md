# Feed engine plan

How the feed picks titles. Only the engine — the endpoint, paging, caching and the guest
feed are out of scope.

## Every input, and where it acts

Nothing else goes in. If a phase below doesn't name one of these, it isn't being used.

| Input                                     | Where it comes from                                                                 | Where it acts                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Liked and disliked titles                 | Taste deck (`movieRatings` / `seriesRatings`, values `like`, `dislike`, `not-seen`) | Phase 1 — the seed list                                                                       |
| Saved and seen titles, with a 1–10 rating | `library_items`                                                                     | Phase 1 — the seed list, and where their strength is set                                      |
| Media type                                | Request path (`/feed/movie`, `/feed/series`)                                        | Phase 2 — two separate walks and pools that never mix                                         |
| Avoid chips                               | `taste.avoid` — horror, gore, anime, war, documentaries, musicals                   | Phase 2 — hard filter, drops candidates outright                                              |
| Era answer                                | `taste.era` — classic, new release, both                                            | Phase 3 — score adjustment by release year                                                    |
| Crowd or critics answer                   | `taste.authority` — popular, critics choice, both                                   | Phase 3 — score adjustment by popularity or rating                                            |
| Explore level                             | `taste.exploreLevel`, 0–4                                                           | Phase 4 only — how deep into the ranked pool a page draws, and how hard it pushes for variety |
| Already shown titles                      | Redis, 7-day list                                                                   | Phase 4 — removed before a page is cut                                                        |
| Everything the user already knows         | Library rows plus liked/disliked from the deck                                      | Built in Phase 1, applied in Phase 2. `not-seen` is **not** removed                           |

Two things read as inputs but aren't: `refresh` re-runs Phase 4 with a different draw and
never rebuilds the pool, and `page` only slices an already-built list.

## The pipeline

The pipeline runs in two parts.

Stages 1 to 4 run in a background job. They save a list of scored titles. Stage 5 runs when
someone opens the app, and reads that saved list.

They are split because the walk makes hundreds of calls to TMDB. That is too slow to do
while a user waits for the screen to load.

**Part one — the background job.** Runs per user, per media type, when their taste or
library changes:

| Stage       | What it does                                                         | Lives in    |
| ----------- | -------------------------------------------------------------------- | ----------- |
| 1. Seeds    | Inputs become one weighted list of titles they've told us about      | `seeds/`    |
| 2. Generate | Each candidate source produces titles: walk, popular, later discover | `generate/` |
| 3. Filter   | Hard rules drop candidates: avoid chips, titles they know, junk      | `filter/`   |
| 4. Score    | One number each, sorted, stored as the ranked pool                   | `score/`    |

**Part two — the request.** Runs every time the app asks for a page:

| Stage   | What it does                                              | Lives in |
| ------- | --------------------------------------------------------- | -------- |
| 5. Deal | Drop what they've been shown, arrange for variety, cut 20 | `deal/`  |

Filtering happens in two places, and that is on purpose. Stage 3 drops titles for reasons
that only change when the user changes their taste or library, so it can run once in the
job. The already-shown list changes every time a page is served, so it has to be applied in
stage 5.

**The phases below are a build order, not the pipeline.** Phase 1 builds stage 1. Phase 2
builds stages 2 and 3. Phase 3 builds stage 4. Phase 4 builds stage 5. Phases 5 to 7 come
back later and add more sources and better scoring.

## Clean start

`src/feed` gets emptied and rebuilt as the folders above. Three things must survive the
delete:

- **The avoid chip mapping** in `constants/avoid.constant.ts`. Six chips to genre ids and
  keyword ids, including that horror needs both because TMDB has no series horror genre,
  and that musicals is movies-only. That mapping was worked out against TMDB's actual data
  and would take a while to work out again.
- **`feedCacheKeys`**, imported by `taste.service.ts` to clear a user's feed when they save
  their taste. Emptying the folder breaks that import, so keep the export or update the
  caller in the same change.
- **The guest and cold-start feed.** Out of scope for the engine but not for the endpoint,
  and the app breaks without it.

---

## Phase 1 — The seed list

**Seeds** are the titles the user has already told us about, good or bad. Everything the
engine does starts from them: Phase 2 walks out from the liked ones, and the pool leaves
out every title on the list, because the user already knows it. One list answers both.

### Two seed sources, never mixed

The taste deck and the library both produce seeds, and they share nothing but the shape of
what they return — a list of `{ id, weight }`, positive for liked, negative for disliked.
The deck carries no strength and no useful date; library rows carry a 1–10 rating and a
date worth using. So each gets its own function and its own rules, and they meet only at
the end, when their weights are added together.

Keep the joining step able to take any number of lists, not exactly two.

### Source A — the taste deck

Answers are `like`, `dislike` or `not-seen`, and nothing more. No strength, no useful date:
every answer was given in the same minute, so recency has no meaning here.

- `like` → **+0.2**
- `dislike` → **−0.2**
- `not-seen` → **skipped entirely.** It says nothing about taste, and leaving it out is
  also what keeps those titles eligible to appear in the feed later.

That is the whole source. Every weight is the same size, because the deck never asks how
much someone liked something.

### Source B — the library

Rows carry a 1–10 rating and a date, so this source has real strength and real age.

| Row                 | Weight |
| ------------------- | ------ |
| Rated 10            | +1.0   |
| Rated 8             | +0.56  |
| Saved, not seen yet | +0.5   |
| Rated 7             | +0.33  |
| Rated 6             | +0.11  |
| Seen, never rated   | +0.1   |
| Rated 5             | −0.11  |
| Rated 1             | −1.0   |

Ratings come from one formula, with the scale read from `library.constants.ts` so the two
can never drift apart:

```
midpoint = (LOWEST_RATING + HIGHEST_RATING) / 2        // 5.5
weight   = (rating - midpoint) / (HIGHEST_RATING - midpoint)
```

**Recency belongs to this source alone.** A title rated last week says more than one rated
two years ago:

```
weight = weight * 0.5 ^ (monthsSinceAction / halfLife)
```

`halfLife = 12` months, from `LibraryItem.createdAt`. Build this after the walk works.
Nothing else depends on it.

### Joining them

Add the two lists. A title in both gets both weights. That addition is the only place the
sources touch, and it's the only thing the joining function does.

### What we're guaranteed

**Movies: at least 5 liked seeds**, enforced by the deck. The movie walk always has
somewhere to start.

**Series: possibly nothing.** The series deck is optional, so a new user can arrive with an
empty seed list. The engine doesn't run — the request falls back to the popular feed until
they rate or save a series. Phase 7 replaces that.

**Weights are flat at first.** With an empty library, source B returns nothing and every
seed is ±0.2. The seed cap and the recency decay do nothing until the library grows.

### Picking seeds from the list

The walk doesn't take all of it. Two picks:

- **Liked walk:** the 30 strongest positives. More than that muddies the taste and slows
  the job; fewer wastes what you know.
- **Disliked walk:** the 10 strongest negatives. That is enough to mark the obvious things
  to stay away from.

Ideally one franchise wouldn't fill either list — five Marvel films as seeds gives you a
pool of Marvel films. But to spot that, you need to know each seed's genre or which series
it belongs to, and we don't store that. Getting it means asking TMDB for the details of all
30 seeds. That is affordable in a job and the answers cache well, but it isn't free. Either
pay for it here, or wait for Phase 5, which puts that data in our own database.

### The exclusion list

Every id in the seed list is dropped from the pool: the user already knows it. Because
"haven't seen it" never enters the list, those titles stay eligible, which is what you want.

### Work items

- [ ] `feed/seeds/from-deck.ts` — taste row in, weighted list out
- [ ] `feed/seeds/from-library.ts` — library rows in, weighted list out, recency included
- [ ] `feed/seeds/join.ts` — several weighted lists in, one out. Adds, nothing else
- [ ] `feed/seeds/pick.ts` — joined list in, liked and disliked seed lists out
- [ ] Tests per source, so a change to library weights can't break the deck
- [ ] Make the backend enforce 5 **liked** movies. `EnoughOpinions` in `save-taste.dto.ts`
      counts likes and dislikes together today, so five dislikes passes and the guarantee
      above isn't real
- [ ] Empty series seed list falls back to the popular feed

---

## Phase 2 — Two-hop walk

**The walk** is how we collect candidates.

Ask TMDB for the recommendations of one title and you get about twenty others back. Ask for
the recommendations of each of those, and you have four hundred. Do it once more and you
have thousands. The walk is that: start at the seeds, follow the recommendation links two
or three steps out, and keep count of how often each title comes up. A title that turns up
often is close to the user's taste. A title that turns up once is not.

Five seeds with one step out gives about a hundred titles. That is all the feed has to
choose from today.

### Two candidate sources, never mixed

The walk and popular titles both produce pool entries directly, and they're scored side by
side. Neither ever becomes a seed — walking from popular titles would only find more
popular titles.

Phases 5 and 7 each add another one, so keep the pool able to take entries from any number
of sources.

### Random walk with restart

Spread weight from the seeds along recommendation links, pulling some back each round.

```
scores = seedWeights            // the liked seeds from Phase 1, made to sum to 1
result = {}

repeat 3 times:
  next = {}
  for each (titleId, weight) in scores:
    neighbours = recommendationIdsOf(titleId)     // ~20 ids
    share = weight * (1 - restart) / neighbours.length
    for each n in neighbours:
      next[n] += share
  for each (seedId, seedWeight) in seedWeights:
    next[seedId] += restart * seedWeight
  scores = next
  add scores into result
```

A title several seeds point at ends up high. One hanging off a single seed ends up low.

Run the same walk on the disliked seeds and subtract the result. Keep it as a **penalty**,
not a block — a title can sit close to both a liked and a disliked seed.

### Media type

Movies and series get their own walk and their own pool. TMDB rarely recommends a series
off a film or the other way round, so mixing them gains nothing.

### What the pool drops before anything is scored

Three hard filters, applied once when the job finishes the walk:

- **The seeds themselves**, and everything already in the library or answered `like` /
  `dislike` in the deck. `not-seen` stays — it says nothing about taste, and they may still
  want to watch it.
- **Avoid chips.** TMDB labels titles two ways: a genre, one of about eighteen fixed
  buckets, and a keyword, a free tag out of thousands. Genre ids come free on every
  candidate, so genre-based chips are dropped on the spot. Gore and anime have no genre of
  their own, and TMDB has no horror genre for series, so those need the candidate's
  keywords — one extra call each, because the recommendations endpoint carries no keywords
  and takes no filters. A candidate whose keywords can't be read is dropped, since an avoid
  is a hard rule.
- **Junk.** Vote count floor, and movies under 30 minutes.

The keyword calls are the expensive part, but they run inside the job rather than in the
request, so nobody waits on them. Phase 5 removes them.

### The blocker

Round two needs recommendations for every title found in round one — hundreds of TMDB
calls. So:

1. `TmdbService.getRecommendationIds(mediaType, id)` — ids only, `@Cacheable` for a month.
   Lists barely change and entries stay tiny.
2. Even cached, a cold walk is too slow for a request. Build the pool in a **BullMQ job**;
   the request reads it.

Point 2 is the real work. The job runs when taste or the library changes, and on a
schedule. A refresh never triggers it — refresh only re-draws a page from the pool that is
already there.

### Numbers

- rounds: 3, restart: 0.2
- pool cap 500 to start, raise it once you can see the walk working

### Work items

- [ ] `getRecommendationIds` with a one-month cache
- [ ] `feed/generate/walk.ts` — pure function, takes a "get neighbours" function so it tests
      offline
- [ ] `feed/generate/popular.ts` — the other candidate source
- [ ] `feed/filter/hard-rules.ts` — pure function: candidates plus the rules in, survivors out
- [ ] BullMQ job runs stages 1 to 4 and stores the pool
- [ ] Test the walk on a small hand-made graph where the answer is obvious

---

## Phase 3 — Scoring

One number per candidate, from five parts:

```
score = w.closeness * closenessScore      // from the liked walk
      + w.quality   * qualityScore        // rating, held back on few votes
      + w.era       * eraScore            // taste.era
      + w.authority * authorityScore      // taste.authority
      - w.disliked  * closenessToDisliked // from the disliked walk
```

### Quality

Pull low-vote titles toward the average:

```
adjusted = (voteCount * rating + minVotes * averageRating) / (voteCount + minVotes)
```

`minVotes = 300`, `averageRating = 6.5`.

The obvious alternative — scale the rating by how many votes it has — looks similar and is
wrong. Under it a 4.0 with 5000 votes and an 8.0 with 150 votes both come out at 0.4, so
bad titles get carried by their vote count.

### Era and authority

Era splits at the year 2000 — `CLASSIC_MAX_YEAR` is 1999, `MODERN_MIN_YEAR` is 2000. A
title on the user's side of that line scores 1, everything else 0. A title with no release
year scores 0 either way.

Authority leans on popularity for the crowd answer and on rating for the critics answer,
because TMDB has no separate critic score.

When either answer is "no preference" the term contributes nothing at all, which is right —
no preference should mean no push, not a push toward the middle.

### The weights are fixed

Explore level does **not** touch them. Turning these weights up and down changes what the
ranking means, so when a feed looks wrong you can't tell whether the ranking is bad or the
slider just flattened it. Tune them once, by hand, and leave them alone.

### Work items

- [ ] `feed/score/score.ts` — pure function, one candidate plus weights in, one number out
- [ ] Each part its own named function, tested on its own
- [ ] Weights as plain constants, same for every user

---

## Phase 4 — Variety

Sorting by score alone gives twenty near-identical thrillers. This step runs when a page is
cut, not when the pool is built, so it can react to what the user has seen since.

Drop anything on the 7-day shown list first, then fill the page one slot at a time. Each
slot goes to whichever title still left has the best mix of a high score and being unlike
what's already on the page:

```
chosen = []
while chosen.length < wanted:
  for each candidate left:
    value = weight * score(candidate)
          - (1 - weight) * highestSimilarityTo(chosen, candidate)
  move the highest-value candidate into chosen
```

`weight` is not a constant — explore level sets it, see below.

Until Phase 5, similarity uses what candidates already carry: genre ids and release year.
`RARITY_WEIGHTS` in `journey.constant.ts` scores each genre by how rare it is, higher being
rarer — Drama 0.5, Western 1.8. Reuse it, so two titles sharing Drama count as less alike
than two sharing Western.

### Explore level — its only two jobs

**How deep into the ranked pool a page draws.** At level 0 every title comes off the top of
the ranking. At level 4 roughly one slot in three is pulled from further down — with a pool
of 500 that means somewhere around rank 50 to 200, titles that scored lower because they
match less closely. The numbers move with the pool cap, so tie them to a share of the pool
rather than to fixed ranks.

**How hard the page pushes for variety.** It sets `weight` above, from about 0.85 at level
0 to about 0.5 at level 4. Low explore takes the best matches even if they're all one kind;
high explore will skip a strong match to avoid putting three of the same kind in a row.

Nothing else. It doesn't touch the scoring weights, and it doesn't set the mix between
candidate sources — popular titles are the generic source, not the adventurous one.

### Refresh

Re-run this step with a different draw and skip what was just served. The pool is untouched,
so a refresh is fast and never falls back to popular titles.

### Work items

- [ ] `feed/deal/arrange.ts` — pure function: scored pool plus shown list in, one page out
- [ ] Similarity on genres and year, weighted by `RARITY_WEIGHTS`
- [ ] Explore level drives the variety weight and how deep a page reaches, nothing else
- [ ] Decide where the popular share comes from, since it's no longer the slider
- [ ] Test: a pool that is 90% one genre must not produce a 90% one-genre page

---

## Phase 5 — Local copy of TMDB titles

Keywords are the sharpest taste signal, but TMDB gives them one title at a time, so scoring
a whole pool on keywords is not possible live. Keyword rarity counts can't be got from live
calls at all. You already pay part of this cost on every build, one call per candidate,
whenever someone picks a keyword avoid chip.

1. Download TMDB's daily export: a file they publish every day listing every title id they
   hold, with nothing but the id, the original title and a popularity number. About a
   million movies, plus series in a separate file.
2. Filter to titles above a vote count floor — 100 is a reasonable start. Leaves roughly
   50–100k.
3. For each: `/movie/{id}?append_to_response=keywords,credits` — one call for details,
   keywords and cast.
4. Store: identifier, media type, title, year, genres, keywords, main cast, director,
   rating, vote count, popularity, runtime, episode count.
5. Daily top-up via `/movie/changes` — only identifiers changed in the last day.

**Rate limit.** First backfill ~100k calls, a few hours. TMDB used to publish 40 requests
per 10 seconds; that figure was removed from their docs and I don't know the current
ceiling. Over the limit returns `429` with a `Retry-After` header — read it and wait. Start
at 10 per second.

**It also unlocks a second pool source.** The walk only reaches titles TMDB already links to
a seed, so mainstream seeds give a mainstream pool no matter how many rounds you run. With
keywords in your own table you can query TMDB discover by the keywords, genres and people
taken from the liked titles, and reach titles the walk can't see. Same pool, same scoring.

### Work items

- [ ] `title` entity, then `npm run migration:gen` (never hand-write the migration)
- [ ] Job: read export, filter, queue detail fetches
- [ ] Job: fetch and store one title, with a queue rate limit
- [ ] Daily changes job
- [ ] Point the avoid-chip keyword check at the table
- [ ] Indexes on vote count, genres, keywords

---

## Phase 6 — Keyword ranking

Profile = keywords of liked titles minus keywords of disliked ones. Score a candidate by
overlap with the profile. Weight each keyword by rarity or everything scores alike:

```
rarity = log(totalTitles / titlesCarryingThisKeyword)
```

One `GROUP BY`, refreshed weekly. Same idea as `RARITY_WEIGHTS` for genres, measured rather
than hand-set.

Divide the overlap by how many keywords each side has, so a title carrying 200 keywords
can't win just by overlapping with everything. (That division is what cosine similarity
does, if you want to look it up.)

Then point Phase 4's similarity at keywords too.

### Work items

- [ ] Keyword rarity table, rebuilt weekly
- [ ] Profile builder from liked and disliked titles
- [ ] Cosine similarity in the database, not in Node
- [ ] Point Phase 4 at keywords

---

## Phase 7 — Series taste from movie taste

Needs no new data. `pools.constant.ts` stores `mainGenreId` on every deck title, so five
liked movies already tell you which genres this person likes, at zero API cost. Run a
discover query for series in those genres, plus era, authority and the avoid chips, and the
series feed starts personal instead of generic.

The fiddly part: TMDB doesn't use the same genres for both. Some movie genres merge on the
TV side (Action and Adventure become one, Science Fiction and Fantasy become one) and some
are renamed (War becomes War & Politics). A few have no series equivalent at all.

- [ ] Movie genre to series genre lookup
- [ ] Discover query from liked movie genres when the series seed list is empty
- [ ] Decide what happens for movie genres with no series match

---

## Order

Phase 1 is small and everything else needs it, so start there. Phase 2 is the biggest gain
and the biggest change. Phase 5 is the most work and runs in parallel, but Phase 6 can't
start until it lands. Phase 7 stands alone and can wait. Otherwise 1 → 2 → 3 → 4, then
5 → 6.

## How to build this

Nicky reviews and must understand every line. So:

- Work in small rounds. One round is one piece: a single function and its test, or one
  entity, or one job. Nothing else rides along.
- A round must be small enough to review in a few minutes.
- Stop after every round. The next round starts only after Nicky approves the last one.
- Never deliver a whole phase at once.

## Ground rules

- One folder per pipeline stage. A file belongs to the stage it runs in, not to a `utils`
  bucket.
- Every stage is a pure function: data in, data out. The network and the database sit in
  the service and the job that call them.
- Stages 1 to 4 run in a job. The request only deals.
- New numbers go in `constants/feed.constant.ts`, not inline.
- Rewrite `how-the-feed-works.md` at the end. Everything in it describes the old engine.
