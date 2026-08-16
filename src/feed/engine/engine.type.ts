/** The currency every stage passes around: a title id with how much we like it. */
export type Seed = {
  id: number;
  weight: number;
};

/** Every pipeline stage is one pure `run`. */
export type Stage<StageInput, StageOutput> = {
  run: (input: StageInput) => StageOutput;
};
