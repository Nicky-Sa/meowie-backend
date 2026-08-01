# How the feed works

Plain-English guide to what happens when someone opens the home screen. The
taste side is covered by `features/taste/how-taste-works.md` in the app repo.

This file only holds what the code can't say for itself — mostly what TMDB does
and doesn't support. Numbers (weights, shares, page size, TTLs) live in
`constants/feed.constant.ts` and are not repeated here.

## What the feed actually is

`GET /v1/feed/movie` and `GET /v1/feed/series` return **a page of 20 TMDB ids** —
nothing else. The app then fetches the details for each id to draw the posters.

Behind that, the backend keeps a ranked **pool** of ids per user per media type,
cached in Redis. Page 1 is the first 20 of the pool, page 2 the next 20, and so
on. When the pool runs short it's topped up from TMDB.

## Who gets what

| Situation                                        | What they get                                   |
| ------------------------------------------------ | ----------------------------------------------- |
| Not logged in                                    | Popular titles, cached for everyone, 1 hour     |
| Logged in, knows no title at all                 | Same popular titles                             |
| Logged in, rated titles in taste or has a library | Their own ranked pool                           |
| Pool ends up empty after filtering               | Falls back to popular — the feed is never empty |

"Knows a title" means they liked or disliked it in the taste deck, or it sits in
their library. Genres used to keep this alive on their own; they don't exist any
more, so a user who liked nothing and saved nothing has nothing to build on.

## Three sources, mixed

Every batch pulls from three places at once, and they're mixed by share so no
single one owns the feed:

- **similar** — the main source. TMDB recommendations for the titles the user
  likes most, from the taste deck and their library. It pages along with the
  discover counter, so later batches bring new titles rather than the same first
  page. Its share grows with how many titles they liked.
- **taste** — TMDB discover, one query per answered question (era, reality lean,
  crowd/critics lean, length window), walking deeper TMDB pages as the user
  scrolls. It no longer narrows by genre, so it is the broad filler rather than
  the aim.
- **popular** — always on, so a narrow taste never turns into a narrow feed.

## What gets hidden, and what gets pushed down

- Anything already **shown** to this user stays hidden for 7 days. Only ids
  actually returned to the app count — not everything that landed in the pool.
- Anything in the user's **library**, or liked or disliked in the taste deck:
  they know it. A title they marked "haven't seen it" is **not** hidden — that
  answer says nothing, and they may still want to watch it.
- Titles TMDB recommends off the ones they **disliked** lose score. They are not
  blocked, because a title can sit close to both a liked and a disliked one.
  Read once per set of disliked ids and cached for a day.
- A **refresh** drops the pool and re-rolls the shuffle. The titles it dropped
  are skipped while that build runs, so the user gets new titles first, but
  they're not hidden for good.

## The avoid chips

The eight chips are not all genres. Each one maps to whatever TMDB actually
understands for that idea, and there are three kinds (`constants/avoid.constant.ts`):
blocked genres, blocked keywords, and length caps.

Genres and keywords are TMDB's own two ways of labelling a title. A genre is one
of ~18 fixed buckets; a keyword is a free tag out of thousands. "Gore" and
"Anime" have no genre of their own, so they can only be blocked by tag.

**Horror needs both.** TMDB has no Horror genre for TV, so the keyword carries
the series side. It covers around 150 well-known series — Supernatural, Stranger
Things, The Walking Dead, American Horror Story — so it's good, not perfect.

**Keyword avoids cost a lookup on the similar source.** The recommendations
endpoint takes no filters and its results carry no keywords, so the only way to
honour a keyword avoid there is to ask TMDB for each candidate's keywords and
drop the matches. Cached for a week per title, and only when the user actually
picked a keyword chip. A title whose keywords can't be read is dropped, since an
avoid is a hard rule. Horror is the most likely chip to be picked and it carries
a keyword, so this runs for most users who avoid anything at all.

**Series length is capped on episodes, not seasons**, because a season means
nothing consistent. The cap blocks roughly the longest third of popular scripted
series, and costs one cached lookup per series candidate when the chip is on.

**"Kids content" only blocks series.** TMDB has no kids genre for films, and
Family isn't the same thing — plenty of Family films are made for adults too.
Blocking kids' films properly would need TMDB certifications (G / PG), which is
a fourth kind of rule.

A "long watches" cap and a "long films" commitment answer contradict each other.
The cap wins: the length floor drops back to the minimum, so the user still gets
films rather than an empty window.

## Things that surprise people

- A user who rated 5 films in the taste deck gives the feed 5 title ids at most,
  and recommendations off 5 titles are narrower than a genre sweep used to be.
  Expect the first feeds to feel tight and repetitive, leaning on popular titles
  until their library grows. The levers are the popular share and the explore
  level.
- The pool has a hard maximum, and that maximum is the end of the feed until the
  cache expires. Both the personalized and the guest feed stop at the same page,
  so the app's "is there another page" check behaves the same either way.
