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
  const candidateIds = new Set(candidates.map(({ id }) => id));
  const scoresByTitle = new Map<number, number>();

  for (const { id, score } of scores) {
    if (!candidateIds.has(id)) {
      throw new Error(`Score returned for an unknown title: ${id}.`);
    }
    if (scoresByTitle.has(id)) {
      throw new Error(`More than one score returned for title: ${id}.`);
    }
    if (!Number.isFinite(score) || score < 0 || score > FIT_LEVELS.length - 1) {
      throw new Error(`Invalid score returned for title: ${id}.`);
    }

    scoresByTitle.set(id, score);
  }

  return candidates
    .map((candidate) => {
      const score = scoresByTitle.get(candidate.id);

      if (score === undefined) {
        throw new Error(`No score returned for title: ${candidate.id}.`);
      }

      return { ...candidate, score };
    })
    .sort((a, b) => b.score - a.score || a.id - b.id);
};
