const MAX_LETTER_CHANGES = 2;

const cleanText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const countLetterChanges = (first: string, second: string) => {
  const firstLetters = [...first];
  const secondLetters = [...second];
  let previousRow = Array.from(
    { length: secondLetters.length + 1 },
    (_value, index) => index,
  );

  for (let i = 1; i <= firstLetters.length; i++) {
    const currentRow = [i];
    for (let j = 1; j <= secondLetters.length; j++) {
      const changeCost = firstLetters[i - 1] === secondLetters[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        previousRow[j] + 1,
        currentRow[j - 1] + 1,
        previousRow[j - 1] + changeCost,
      );
    }
    previousRow = currentRow;
  }

  return previousRow[secondLetters.length];
};

/**
 * Only a name that contains the query counts, so "two brothers rob banks"
 * is not a match for the title "Her", even though "brothers" contains "her".
 */
export const hasCloseMatch = (query: string, names: string[]) => {
  const cleanQuery = cleanText(query);

  return names.some((name) => {
    const cleanName = cleanText(name);
    return (
      cleanName.includes(cleanQuery) ||
      countLetterChanges(cleanQuery, cleanName) <= MAX_LETTER_CHANGES
    );
  });
};
