import { FlexibleSchema } from 'ai';

export type AskOptions<Answer> = {
  instructions: string;
  prompt: string;
  schema: FlexibleSchema<Answer>;
  timeoutMs: number;
};
