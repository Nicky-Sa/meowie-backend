import { Injectable } from '@nestjs/common';
import {
  AnthropicLanguageModelOptions,
  AnthropicProvider,
  createAnthropic,
} from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { EnvService } from '@/env/env.service';
import { AI_MODEL } from '@/ai/ai.constants';
import { AskOptions } from '@/ai/ai.type';

@Injectable()
export class AiService {
  private readonly anthropic: AnthropicProvider;

  constructor(private readonly env: EnvService) {
    this.anthropic = createAnthropic({
      apiKey: this.env.get('ANTHROPIC_API_KEY'),
    });
  }

  async ask<Answer>({
    instructions,
    prompt,
    schema,
    timeoutMs,
  }: AskOptions<Answer>): Promise<Answer> {
    const { output } = await generateText({
      model: this.anthropic(AI_MODEL),
      instructions,
      prompt,
      output: Output.object({ schema }),
      providerOptions: {
        anthropic: { effort: 'low' } satisfies AnthropicLanguageModelOptions,
      },
      timeout: timeoutMs,
      // A retry would only make the user wait longer; callers have their own fallback.
      maxRetries: 0,
    });

    return output;
  }
}
