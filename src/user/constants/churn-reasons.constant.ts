export class ChurnReason {
  id: string;
  label: string;
}

export const CHURN_REASONS: ChurnReason[] = [
  {
    id: 'dont_like_app',
    label: "I don't like the app.",
  },
  {
    id: 'found_better_app',
    label: 'I found a better app.',
  },
  {
    id: 'performance_issues',
    label: 'The app is too slow or buggy.',
  },
  {
    id: 'privacy_concerns',
    label: 'I am concerned about my data privacy.',
  },
  {
    id: 'other',
    label: 'Other',
  },
] as const;

// Extract the Type (Result: "dont_like_app" | "found_better_app" | ...)
export type ChurnReasonId = (typeof CHURN_REASONS)[number]['id'];

// Extract the IDs for runtime validation (Result: ["dont_like_app", ...])
export const CHURN_REASONS_IDS = CHURN_REASONS.map((r) => r.id);
