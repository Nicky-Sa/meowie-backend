export const AI_SEARCH_TIMEOUT_MS = 5_000;
export const AI_SEARCH_MAX_MATCHES = 5;
export const CLOSE_MATCH_RESULT_COUNT = 5;

export const AI_SEARCH_PROMPT = `You help the search box of a movie and TV app.
The user typed the search below. It may have typos, describe a plot, quote a line, use another language or script, or describe a person.
Work out which movies, TV series or people the user most likely means.
If the search is already a real title or name, return it exactly as it is. Never "fix" an odd spelling that is part of a real title.
Return up to ${AI_SEARCH_MAX_MATCHES} matches, best first. Use the English title or name as it appears on TMDB, and the release year for movies and series.`;
