# Feed engine plan

How the feed picks titles. Only the engine — the endpoint, paging, caching and the guest feed are out of scope.

## Every input, and where it acts

Nothing else goes in. If a phase below doesn't name one of these, it isn't being used.

| Input                                     | Where it comes from                                                                 | Where it acts                                                                                 |
|-------------------------------------------|-------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Liked and disliked titles                 | Taste deck (`movieRatings` / `seriesRatings`, values `like`, `dislike`, `not-seen`) | Phase 1 — the seed list                                                                       |
| Saved and seen titles, with a 1–10 rating | `library_items`                                                                     | Phase 1 — the seed list, and where their strength is set                                      |
| Media type                                | Request path (`/feed/movie`, `/feed/series`)                                        | Phase 2 — two separate walks and pools that never mix                                         |
| Avoid chips                               | `taste.avoid` — horror, gore, anime, war, documentaries, musicals                   | Phase 2 — hard filter, drops candidates outright                                              |
| Era answer                                | `taste.era` — classic, new release, both                                            | Phase 3 — score adjustment by release year                                                    |
| Crowd or critics answer                   | `taste.authority` — popular, critics choice, both                                   | Phase 3 — score adjustment by popularity or rating                                            |
| Explore level                             | `taste.exploreLevel`, 0–4                                                           | Phase 4 only — how deep into the ranked pool a page draws, and how hard it pushes for variety |
| Already shown titles                      | Redis, 7-day list                                                                   | Phase 4 — removed before a page is cut                                                        |
| Everything the user already knows         | Library rows plus liked/disliked from the deck                                      | Built in Phase 1, applied in Phase 2. `not-seen` is **not** removed                           |

Two things read as inputs but aren't: `refresh` re-runs Phase 4 with a different draw and never rebuilds the pool, and
`page` only slices an already-built list.

## The pipeline

The pipeline runs in two parts.

Stages 1 to 4 run in a background job. They save a list of scored titles. Stage 5 runs when someone opens the app, and
reads that saved list.

They are split because the walk makes hundreds of calls to TMDB. That is too slow to do while a user waits for the
screen to load.

**Part one — the background job.** Runs per user, per media type, when their taste or library changes:

| Stage       | What it does                                                         | Lives in    |
|-------------|----------------------------------------------------------------------|-------------|
| 1. Seeds    | Inputs become one weighted list of titles they've told us about      | `seeds/`    |
| 2. Generate | Each candidate source produces titles: walk, popular, later discover | `generate/` |
| 3. Filter   | Hard rules drop candidates: avoid chips, titles they know, junk      | `filter/`   |
| 4. Score    | One number each, sorted, stored as the ranked pool                   | `score/`    |

**Part two — the request.** Runs every time the app asks for a page:

| Stage   | What it does                                              | Lives in |
|---------|-----------------------------------------------------------|----------|
| 5. Deal | Drop what they've been shown, arrange for variety, cut 20 | `deal/`  |

Filtering happens in two places, and that is on purpose. Stage 3 drops titles for reasons that only change when the user
changes their taste or library, so it can run once in the job. The already-shown list changes every time a page is
served, so it has to be applied in stage 5.

**The phases below are a build order, not the pipeline.** Phase 1 builds stage 1. Phase 2 builds stages 2 and 3. Phase 3
builds stage 4. Phase 4 builds stage 5. Phases 5 to 7 come back later and add more sources and better scoring.

## Clean start

`src/feed` gets emptied and rebuilt as the folders above. Three things must survive the delete:

- **The avoid chip mapping** in `constants/avoid.constant.ts`. Six chips to genre ids and keyword ids, including that
  horror needs both because TMDB has no series horror genre, and that musicals is movies-only. That mapping was worked
  out against TMDB's actual data and would take a while to work out again.
- **`feedCacheKeys`**, imported by `taste.service.ts` to clear a user's feed when they save their taste. Emptying the
  folder breaks that import, so keep the export or update the caller in the same change.
- **The guest and cold-start feed.** Out of scope for the engine but not for the endpoint, and the app breaks without
  it.

---

## Phase 1 — The seed list

**Seeds** are the titles the user has already told us something about, either by liking, disliking, rating, saving, or
watching them. Everything starts here.

The seed list is also used later to remove titles the user already knows from the feed.

### Two seed sources, never mixed

There are two sources of seeds:

* **Taste deck** — explicit `like`, `dislike`, or `not-seen` answers.
* **Library** — saved and seen titles, with an optional 1–10 rating and a date.

Each source has its own rules. They both return `{ id, weight }`, with positive weights meaning good and negative
weights meaning bad. They are joined at the end.

The join must accept any number of seed lists, not just these two. Each source has a priority. If the same title appears
more than once, the entry with the highest priority wins.

For now:

```text
library = priority 1
taste   = priority 2
```

This means the library always wins when a title appears in both sources, even if it changes the sign.

For example:

```text
taste deck:  Inception → like     (+0.2)
library:     Inception → rated 3  (negative)
```

The library entry replaces the taste-deck entry completely. We do not add the two weights together.

### Source A — the taste deck

The deck only tells us `like`, `dislike`, or `not-seen`.

* `like` → **+0.2**
* `dislike` → **−0.2**
* `not-seen` → **skip it**

`not-seen` is important: it says nothing about the user's taste, so it must not become a seed. The title can still
appear in the feed later.

Every deck answer has the same weight because the deck doesn't ask how strongly the user feels about a title.

### Source B — the library

Library rows have more information, so they get their own weights:

| Row                 | Weight |
|---------------------|-------:|
| Rated 10            |   +1.0 |
| Rated 8             |  +0.56 |
| Saved, not seen yet |   +0.5 |
| Rated 7             |  +0.33 |
| Rated 6             |  +0.11 |
| Seen, never rated   |   +0.1 |
| Rated 5             |  −0.11 |
| Rated 1             |   −1.0 |

Ratings use one formula:

```text
midpoint = (LOWEST_RATING + HIGHEST_RATING) / 2
weight   = (rating - midpoint) / (HIGHEST_RATING - midpoint)
```

With a 1–10 scale, that gives:

```text
10 → +1.0
5  → -0.11
1  → -1.0
```

The other values are fixed constants from the library rules.

### Recency

Recency only applies to library entries.

A recent action should count more than an old one:

```text
weight = weight * 0.5 ^ (monthsSinceAction / halfLife)
```

`halfLife = 12` months.

Use `LibraryItem.createdAt` for the date.

Recency is applied **before picking the strongest seeds**, so an old rating can become weaker than a newer one.

Nothing else uses recency.

### Joining the sources

Join all seed lists into one list.

If a title appears in more than one source, keep the entry from the source with the highest priority and discard the
others.

Do not add the weights together.

For example:

```text
taste deck:  Inception → +0.2
library:     Inception → +1.0

result:      Inception → +1.0
```

And if the library disagrees with the deck:

```text
taste deck:  Inception → +0.2
library:     Inception → -0.56

result:      Inception → -0.56
```

### Picking seeds for the walk

The walk doesn't use every seed.

Pick:

* **Positive walk:** the 30 strongest positive seeds.
* **Negative walk:** the 10 strongest negative seeds.

"Strongest" means the largest absolute weight after recency has been applied.

The positive and negative lists are separate. A title can only be in one of them after the sources have been joined.

### What gets excluded later

Keep the full joined seed list available so Phase 2 can exclude everything the user already knows.

That includes:

* library titles
* `like` titles
* `dislike` titles

`not-seen` titles are not in the seed list and therefore stay eligible for the feed.

### Guarantees

**Movies:** the deck requires at least 5 liked titles, so the movie walk always has something to start from.

**Series:** the series deck is optional. A new user can therefore have no series seeds. In that case, don't run the
series walk and fall back to the popular feed until they rate or save a series.

**Empty library:** without library data, all deck seeds are simply ±0.2.

### Work items

* [x] `feed/engine/1-seeds/taste.source.ts` — taste answers in, weighted list out
* [x] `feed/engine/1-seeds/library.source.ts` — library rows in, weighted list out, recency included
* [x] `feed/engine/1-seeds/helpers.ts` — joins weighted lists and picks positive and negative walk seeds
* [x] Test that the library completely replaces a matching taste-deck entry, including when the sign changes
* [x] Test that recency is applied before the 30/10 seed selection
* [x] Test that `not-seen` never becomes a seed
* [x] Make the backend enforce 5 **liked** movies. `EnoughOpinions` (now `EnoughLikes`) currently counts likes and
  dislikes together, so five dislikes can pass the check.

---

## Phase 2 — Walk and candidate generation

The goal of this phase is to build a pool of titles that might be worth showing.

There are two sources for now:

1. **The walk** — finds titles close to the user's existing taste.
2. **Popular titles** — gives us good general candidates that the walk might never reach.

Both produce candidates for the same pool. Neither source scores the title for quality yet. That happens in Phase 3.

### 2.1 — The recommendation walk

The walk starts from the positive and negative seeds from Phase 1 and follows TMDB's recommendation links.

If a title has about 20 recommendations, one seed can produce about 20 candidates. Following those candidates again
produces many more.

The walk runs separately for positive and negative seeds:

```text
positive seeds → positive walk
negative seeds → negative walk
```

The positive walk tells us:

> How closely is this title connected to things the user likes?

The negative walk tells us:

> How closely is this title connected to things the user dislikes?

The two walks never mix.

### Spread the weight

Each seed starts with its Phase 1 weight.

For every round:

1. Take the strongest `MAX_FRONTIER` titles from the current scores.
2. Get their TMDB recommendations.
3. Spread most of each title's weight evenly across its recommendations.
4. Keep weaker titles that weren't followed in the current scores. They stay candidates but don't generate another hop.
5. Put the restart portion back onto the original seeds.
6. Add the new scores to the result.
7. Repeat for `WALK_ROUNDS` rounds.

In simple terms:

```text
current scores
      ↓
follow the strongest titles
      ↓
spread their weight to recommendations
      ↓
put some weight back on the original seeds
      ↓
next round
```

The important part is that **not being in the frontier doesn't remove a title from the pool**. It only means that title
doesn't get to generate another hop.

### Weight split

With:

```text
restart = 0.2
```

80% of a title's weight moves to its recommendations and 20% goes back to the original seed distribution.

For example:

```text
title weight = 0.5
20 recommendations

0.5 × 0.8 = 0.4 passed forward
0.4 / 20  = 0.02 per recommendation
```

The remaining:

```text
0.5 × 0.2 = 0.1
```

is returned to the original seeds.

### Multiple paths add together

If several titles point at the same recommendation, their weights are added.

For example:

```text
Inception     → Arrival   0.10
Interstellar  → Arrival   0.15
```

Arrival gets:

```text
0.25
```

That is a useful signal because it means multiple strong titles led to the same candidate.

### No recommendations

If a title has no recommendations, it doesn't generate anything for the next round.

It doesn't cause the walk to fail, and it doesn't create any new candidates.

### The result of the walk

The walk returns the accumulated weights from all rounds.

A title that repeatedly appears, or is reached through several strong paths, ends up with a higher weight than a title
that appears once.

The positive walk produces a **positive closeness signal**.

The negative walk produces a separate **negative closeness signal**.

Don't make the negative walk return negative numbers. Both walks should use the same simple `{ id, weight }` shape.
Phase 3 decides how the negative signal affects the final score.

### Media type

Movies and series have separate walks and separate pools.

A movie walk only asks for movie recommendations. A series walk only asks for series recommendations.

They never mix.

### 2.2 — Popular candidates

Popular titles are a second way to find candidates.

The purpose isn't to make the feed generic. It's to catch good titles that the recommendation graph never reaches.

For example, a user might have fairly unusual taste, and none of their seeds may point to a highly rated title that
would still be a good fit. Popular candidates give the feed another way to discover it.

Popular titles do **not** become seeds and are never used as starting points for the walk.

For now, popular candidates are simply added to the candidate pool. Phase 3 decides how they score alongside titles
found by the walk.

If a title comes from both the walk and the popular source, keep both signals rather than creating a duplicate
candidate. The candidate should carry the walk weight and the fact that it was also found by the popular source.

### 2.3 — Hard filtering

Once all candidates have been generated, apply the hard filters.

Drop:

* **Titles the user already knows:** everything in the full Phase 1 seed list, including library titles and `like` /
  `dislike` answers. `not-seen` titles stay eligible.
* **Avoid chips:** drop titles matching the user's hard avoids.
* **Junk:** apply the vote-count floor and the minimum movie runtime.

Avoids are hard rules. If a title matches one, it is removed rather than merely getting a lower score.

For genre-based avoids, use the genre ids already returned with the candidate.

For avoids that need keywords, fetch the candidate's keywords. If the keywords cannot be read, drop the candidate
because we can't safely verify the hard rule.

### TMDB calls

The walk can make a lot of TMDB calls, especially in later rounds.

Use:

```text
getRecommendationIds(mediaType, id)
```

to fetch recommendation ids only.

Cache these responses for one month. Recommendation lists change slowly and the response is small.

The walk itself should not call TMDB directly. It should receive a function such as:

```ts
getNeighbours(id)
```

so the walk stays a pure function and can be tested with a small hand-made graph.

The full walk runs in the background job, not during a feed request.

### Numbers

Start with:

```text
WALK_ROUNDS = 3
WALK_RESTART = 0.2
MAX_FRONTIER = 200
```

Don't assume these are optimal. They are starting values.

The initial pool cap is 500 titles. Raise it later if the walk produces enough useful candidates.

Before choosing a larger cap, measure how many different candidates the walk actually produces after filtering. If five
mainstream seeds only produce a few hundred useful titles, increasing the cap won't solve the problem.

### Work items

* [x] `getRecommendationIds` with a one-month cache
* [x] `feed/engine/2-generate/walk.source.ts` — pure function, takes a `getNeighbours` function
* [x] Test the walk on a small hand-made graph where the answer is obvious
* [x] Test that weights from multiple paths are added together
* [x] Test that titles outside the frontier stay in the pool but don't generate another hop
* [x] Test that a title with no recommendations doesn't break the walk
* [x] Run the positive and negative walks separately
* [x] `feed/engine/2-generate/popular.source.ts` — popular candidates as a separate source
* [ ] Merge candidates from all sources without duplicating titles
* [ ] `feed/filter/hard-rules.ts` — candidates plus the rules in, survivors out
* [ ] Pool-build orchestration: for series with no seeds, skip the walk and use popular candidates
* [ ] BullMQ job runs stages 1 to 4 and stores the pool

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

The obvious alternative — scale the rating by how many votes it has — looks similar and is wrong. Under it a 4.0 with
5000 votes and an 8.0 with 150 votes both come out at 0.4, so bad titles get carried by their vote count.

### Era and authority

Era splits at the year 2000 — `CLASSIC_MAX_YEAR` is 1999, `MODERN_MIN_YEAR` is 2000. A title on the user's side of that
line scores 1, everything else 0. A title with no release year scores 0 either way.

Authority leans on popularity for the crowd answer and on rating for the critics answer, because TMDB has no separate
critic score.

When either answer is "no preference" the term contributes nothing at all, which is right — no preference should mean no
push, not a push toward the middle.

### The weights are fixed

Explore level does **not** touch them. Turning these weights up and down changes what the ranking means, so when a feed
looks wrong you can't tell whether the ranking is bad or the slider just flattened it. Tune them once, by hand, and
leave them alone.

### Work items

- [ ] `feed/score/score.ts` — pure function, one candidate plus weights in, one number out
- [ ] Each part its own named function, tested on its own
- [ ] Weights as plain constants, same for every user

---

## Phase 4 — Variety

Sorting by score alone gives twenty near-identical thrillers. This step runs when a page is cut, not when the pool is
built, so it can react to what the user has seen since.

Drop anything on the 7-day shown list first, then fill the page one slot at a time. Each slot goes to whichever title
still left has the best mix of a high score and being unlike what's already on the page:

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
`RARITY_WEIGHTS` in `journey.constant.ts` scores each genre by how rare it is, higher being rarer — Drama 0.5, Western
1.8. Reuse it, so two titles sharing Drama count as less alike than two sharing Western.

### Explore level — its only two jobs

**How deep into the ranked pool a page draws.** At level 0 every title comes off the top of the ranking. At level 4
roughly one slot in three is pulled from further down — with a pool of 500 that means somewhere around rank 50 to 200,
titles that scored lower because they match less closely. The numbers move with the pool cap, so tie them to a share of
the pool rather than to fixed ranks.

**How hard the page pushes for variety.** It sets `weight` above, from about 0.85 at level 0 to about 0.5 at level 4.
Low explore takes the best matches even if they're all one kind; high explore will skip a strong match to avoid putting
three of the same kind in a row.

Nothing else. It doesn't touch the scoring weights, and it doesn't set the mix between candidate sources — popular
titles are the generic source, not the adventurous one.

### Refresh

Re-run this step with a different draw and skip what was just served. The pool is untouched, so a refresh is fast and
never falls back to popular titles.

A refresh doesn't need new titles, it needs the rest of the pool. The first page took 20 out of hundreds, and the ones
just under the top are titles several seeds also pointed at, so their scores sit close together. The user sees different
films, not worse ones.

**A refresh never rebuilds the pool.** That is the job, minutes of TMDB calls, and it would mostly hand back the same
titles because the seeds haven't changed. New titles come from Phase 5's discover queries, not from walking the same
links again.

**When the shown list covers the whole pool**, drop its oldest entries instead of falling back to popular. Someone who
has been through the entire pool this week can meet the top of it again. Popular is the generic feed, which is the thing
this engine exists to replace.

### Work items

- [ ] `feed/deal/arrange.ts` — pure function: scored pool plus shown list in, one page out
- [ ] Similarity on genres and year, weighted by `RARITY_WEIGHTS`
- [ ] Explore level drives the variety weight and how deep a page reaches, nothing else
- [ ] Decide where the popular share comes from, since it's no longer the slider
- [ ] Shown list drops its oldest entries once it covers the pool
- [ ] Split `MAX_FEED_PAGE` from `MAX_POOL_SIZE` so the pool cap can grow on its own
- [ ] Test: a pool that is 90% one genre must not produce a 90% one-genre page
- [ ] Test: refreshing until the pool is used up keeps serving pool titles, never popular

---

## Phase 5 — Local copy of TMDB titles

Keywords are the sharpest taste signal, but TMDB gives them one title at a time, so scoring a whole pool on keywords is
not possible live. Keyword rarity counts can't be got from live calls at all. You already pay part of this cost on every
build, one call per candidate, whenever someone picks a keyword avoid chip.

1. Download TMDB's daily export: a file they publish every day listing every title id they hold, with nothing but the
   id, the original title and a popularity number. About a million movies, plus series in a separate file.
2. Filter to titles above a vote count floor — 100 is a reasonable start. Leaves roughly 50–100k.
3. For each: `/movie/{id}?append_to_response=keywords,credits` — one call for details, keywords and cast.
4. Store: identifier, media type, title, year, genres, keywords, main cast, director, rating, vote count, popularity,
   runtime, episode count.
5. Daily top-up via `/movie/changes` — only identifiers changed in the last day.

**Rate limit.** First backfill ~100k calls, a few hours. TMDB used to publish 40 requests per 10 seconds; that figure
was removed from their docs and I don't know the current ceiling. Over the limit returns `429` with a `Retry-After`
header — read it and wait. Start at 10 per second.

**It also unlocks a second pool source.** The walk only reaches titles TMDB already links to a seed, so mainstream seeds
give a mainstream pool no matter how many rounds you run. With keywords in your own table you can query TMDB discover by
the keywords, genres and people taken from the liked titles, and reach titles the walk can't see. Same pool, same
scoring.

### Work items

- [ ] `title` entity, then `npm run migration:gen` (never hand-write the migration)
- [ ] Job: read export, filter, queue detail fetches
- [ ] Job: fetch and store one title, with a queue rate limit
- [ ] Daily changes job
- [ ] Point the avoid-chip keyword check at the table
- [ ] Indexes on vote count, genres, keywords

---

## Phase 6 — Keyword ranking

Profile = keywords of liked titles minus keywords of disliked ones. Score a candidate by overlap with the profile.
Weight each keyword by rarity or everything scores alike:

```
rarity = log(totalTitles / titlesCarryingThisKeyword)
```

One `GROUP BY`, refreshed weekly. Same idea as `RARITY_WEIGHTS` for genres, measured rather than hand-set.

Divide the overlap by how many keywords each side has, so a title carrying 200 keywords can't win just by overlapping
with everything. (That division is what cosine similarity does, if you want to look it up.)

Then point Phase 4's similarity at keywords too.

### Work items

- [ ] Keyword rarity table, rebuilt weekly
- [ ] Profile builder from liked and disliked titles
- [ ] Cosine similarity in the database, not in Node
- [ ] Point Phase 4 at keywords

---

## Phase 7 — Series taste from movie taste

Needs no new data. `pools.constant.ts` stores `mainGenreId` on every deck title, so five liked movies already tell you
which genres this person likes, at zero API cost. Run a discover query for series in those genres, plus era, authority
and the avoid chips, and the series feed starts personal instead of generic.

The fiddly part: TMDB doesn't use the same genres for both. Some movie genres merge on the TV side (Action and Adventure
become one, Science Fiction and Fantasy become one) and some are renamed (War becomes War & Politics). A few have no
series equivalent at all.

- [ ] Movie genre to series genre lookup
- [ ] Discover query from liked movie genres when the series seed list is empty
- [ ] Decide what happens for movie genres with no series match

---

## Order

Phase 1 is small and everything else needs it, so start there. Phase 2 is the biggest gain and the biggest change. Phase
5 is the most work and runs in parallel, but Phase 6 can't start until it lands. Phase 7 stands alone and can wait.
Otherwise 1 → 2 → 3 → 4, then 5 → 6.

## How to build this

Nicky reviews and must understand every line. So:

- Work in small rounds. One round is one piece: a single function and its test, or one entity, or one job. Nothing else
  rides along.
- A round must be small enough to review in a few minutes.
- Stop after every round. The next round starts only after Nicky approves the last one.
- Never deliver a whole phase at once.

## Ground rules

- One folder per pipeline stage. A file belongs to the stage it runs in, not to a `utils`
  bucket.
- Every stage is a pure function: data in, data out. The network and the database sit in the service and the job that
  call them.
- Stages 1 to 4 run in a job. The request only deals.
- New numbers go in `constants/feed.constant.ts`, not inline.
- Rewrite `how-the-feed-works.md` at the end. Everything in it describes the old engine.
