export const extractYearFromDate = (date: string | null | undefined) => {
  if (!date) {
    return '-';
  }
  return new Date(date).getFullYear().toString();
};
