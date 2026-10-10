import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';

export const FIT_LEVELS = [
  'Very poor fit: strongly matches what the user dislikes or rates low.',
  'Poor fit: more evidence against this title than in its favor.',
  'Unclear or mixed fit: little evidence, or positive and negative evidence are balanced.',
  'Good fit: clear links to titles the user enjoys, with little evidence against it.',
  "Excellent fit: strong links to the user's favorite titles and few links to disliked titles.",
] as const;

export const sortScoredTitles = (titles: ScoredTitle[]): ScoredTitle[] =>
  [...titles].sort((a, b) => b.score - a.score || a.id - b.id);
