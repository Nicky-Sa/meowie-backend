export const extractYearFromDate = (date: string | null | undefined) => {
  if (!date) {
    return 'N/A';
  }
  return new Date(date).getFullYear().toString();
};
