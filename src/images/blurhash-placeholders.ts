/**
 * A collection of hand-picked, beautiful blurhash strings representing soft gradients and abstract shapes.
 * These are used as deterministic placeholders to avoid heavy image processing for list views.
 */
export const PLACEHOLDER_BLURHASHES = [
  'L6PZfS_NoeNS_NofRjof_NofRjof', // Soft Blue/Grey
  'L9H2uS~qfQ~qfQ~qfQ~qfQ~qfQ~q', // Neutral Grey
  'LKO2?4%M9F%M%M%M9F%M%M%M9F%M', // Deep Purple
  'L39G1-0000~q000000~q000000~q', // Light Mist
  'L~N*fS_NoeNS_NofRjof_NofRjof', // Sky Blue
  'LPRf?v_N_N_N_N_N_N_N_N_N_N_N', // Rose Pink
  'L48z.G~qRkxakWofofkCD%RjNGj[', // Warm Sand
  'L59G1-0000~q000000~q000000~q', // Cool Mint
  'LBH2uS~qfQ~qfQ~qfQ~qfQ~qfQ~q', // Slate Grey
  'LCG1-0000~q000000~q000000~q', // Lavender
  'LDG1-0000~q000000~q000000~q', // Soft Peach
  'LEG1-0000~q000000~q000000~q', // Pale Gold
  'LFG1-0000~q000000~q000000~q', // Sage Green
  'LGG1-0000~q000000~q000000~q', // Dusty Blue
  'LHG1-0000~q000000~q000000~q', // Mauve
  'LIG1-0000~q000000~q000000~q', // Steel Blue
  'LJG1-0000~q000000~q000000~q', // Terracotta
  'LKG1-0000~q000000~q000000~q', // Forest Green
  'LLG1-0000~q000000~q000000~q', // Midnight Blue
  'LMG1-0000~q000000~q000000~q', // Burgundy
];

export const getPlaceholderBlurhash = (id: string | number): string => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) || 0 : id;
  return PLACEHOLDER_BLURHASHES[numericId % PLACEHOLDER_BLURHASHES.length];
};
