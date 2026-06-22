# Feed recommendation pipeline

```mermaid
flowchart TD
    %% ---------- Sources ----------
    KW[Taste<br/>keywords + genres]
    LIB[Library<br/>saves + ratings]
    FUT[Future source<br/>pluggable]

    %% ---------- ① Profile ----------
    subgraph PROFILE["① Profile · what the user likes"]
        direction TB
        TC[TasteContributor] --> PB[ProfileBuilder<br/>merge · sum weights by id]
        LC[LibraryContributor] --> PB
    end
    KW --> TC
    LIB --> LC
    FUT -. extends BaseContributor .-> PB
    PB --> FP[/FeedProfile<br/>keywordIds · genreIds<br/>libraryMovieIds · librarySeriesIds/]

    %% ---------- Context ----------
    FLEX[flexibility] --> CTX[[FeedContext]]
    FP --> CTX

    %% ---------- ② Engine ----------
    subgraph ENGINE["② Engine · EngineService.buildBatch"]
        direction TB
        CG["CandidateGenerator<br/>discover + library recs<br/>popular = fallback"]
        FILT["Filters · AlreadyServed · ExcludeIds"]
        SCOR["Scorers, weighted by flexibility<br/>genreMatch · quality · similar · shuffle"]
        RANK["dedupe by max score → sort desc"]
        CG --> FILT --> SCOR --> RANK
    end
    CAT[(TMDB catalog)] --> CG
    CTX --> CG
    RANK --> IDS[ranked ids]

    %% ---------- ③ Service ----------
    IDS --> SVC["③ FeedService<br/>pool cache · served · pagination · refresh"]
    SVC --> OUT([Feed page · ready to serve])
    CTX -. cold start / guest .-> GUEST[guestFeed · popular] -.-> OUT
```

## Stages

1. **Profile** — `ProfileBuilder` aggregates `BaseContributor`s (`TasteContributor`,
   `LibraryContributor`; future signals plug in by extending `BaseContributor`) into a
   `FeedProfile` of weighted ids. Media-agnostic, so it's cacheable per user.
2. **Engine** — `EngineService.buildBatch` turns a `FeedContext` (profile + flexibility +
   exclude/served + paging) into ranked ids: `CandidateGenerator` (taste discovery and
   library recommendations, popular as fallback) → filters → flexibility-weighted scorers
   → dedupe-by-max-score → sort.
3. **Service** — `FeedService` owns the cached pool, the served set, pagination, and
   refresh, and falls back to the public popular feed for guests and cold starts so a page
   is never empty.

`flexibility` is a ranking knob, not a taste signal: it lives on the `FeedContext` and
drives the scorer weights (`RANKING_WEIGHTS_BY_FLEXIBILITY`), not the profile.
