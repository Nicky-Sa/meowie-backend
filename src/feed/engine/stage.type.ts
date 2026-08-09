/** Every pipeline stage is one pure `run`. */
export type Stage<In, Out> = { run: (input: In) => Out };
