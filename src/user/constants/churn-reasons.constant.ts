import { Option } from '@/types/option';

// `satisfies` rather than a type annotation: an annotation widens every id back
// to string, which quietly turns ChurnReasonId below into string.
export const CHURN_REASONS = [
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
] as const satisfies readonly Option[];

// "dont_like_app" | "found_better_app" | ...
export type ChurnReasonId = (typeof CHURN_REASONS)[number]['id'];

// The same ids at runtime, for validation.
export const CHURN_REASONS_IDS = CHURN_REASONS.map((reason) => reason.id);
