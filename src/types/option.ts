/**
 * Something the user picks from a list. The id is stable and gets stored; the
 * label is only what's shown, so it can be reworded freely.
 */
export type Option<TId extends string = string> = {
  id: TId;
  label: string;
  description?: string;
};
