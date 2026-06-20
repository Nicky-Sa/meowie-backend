export class FlexibilityOption {
  id: string;
  label: string;
}

export const FLEXIBILITY_OPTIONS: FlexibilityOption[] = [
  {
    id: 'strict',
    label: 'Strict',
  },
  {
    id: 'normal',
    label: 'Normal',
  },
  {
    id: 'flexible',
    label: 'Flexible',
  },
] as const;

// Extract the Type (Result: "flexible" | "normal" | "strict")
export type FlexibilityOptionId = (typeof FLEXIBILITY_OPTIONS)[number]['id'];

// Extract the IDs for runtime validation (Result: ["flexible", "normal", "strict"])
export const FLEXIBILITY_OPTION_IDS = FLEXIBILITY_OPTIONS.map((o) => o.id);
