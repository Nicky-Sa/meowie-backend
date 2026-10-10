import {
  ScoreSortingRequest,
  ScoreSortingResult,
} from '@/feed/engine/scoring/scoring.types';

export const FIT_LEVELS = [
  'Very poor fit: strongly matches what the user dislikes or rates low.',
  'Poor fit: more evidence against this title than in its favor.',
  'Unclear or mixed fit: little evidence, or positive and negative evidence are balanced.',
  'Good fit: clear links to titles the user enjoys, with little evidence against it.',
  "Excellent fit: strong links to the user's favorite titles and few links to disliked titles.",
] as const;

export const sortScoredCandidates = ({
  candidates,
  scores,
}: ScoreSortingRequest): ScoreSortingResult => {
  const candidateIds = new Set(
    candidates.map(({ id, mediaType }) => `${mediaType}:${id}`),
  );
  const scoresByTitle = new Map<string, number>();

  for (const { id, mediaType, score } of scores) {
    const titleId = `${mediaType}:${id}`;

    if (!candidateIds.has(titleId)) {
      throw new Error(`Score returned for an unknown title: ${titleId}.`);
    }
    if (scoresByTitle.has(titleId)) {
      throw new Error(`More than one score returned for title: ${titleId}.`);
    }
    if (!Number.isFinite(score) || score < 0 || score > FIT_LEVELS.length - 1) {
      throw new Error(`Invalid score returned for title: ${titleId}.`);
    }

    scoresByTitle.set(titleId, score);
  }

  return candidates
    .map((candidate) => {
      const titleId = `${candidate.mediaType}:${candidate.id}`;
      const score = scoresByTitle.get(titleId);

      if (score === undefined) {
        throw new Error(`No score returned for title: ${titleId}.`);
      }

      return { ...candidate, score };
    })
    .sort((a, b) => b.score - a.score || a.id - b.id);
};
