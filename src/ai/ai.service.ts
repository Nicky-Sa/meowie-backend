import { Injectable, Logger } from '@nestjs/common';
import { generateText } from 'ai';
import {
  createGoogleGenerativeAI,
  GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import { EnvService } from '../env/env.service';

@Injectable()
export class AiService {
  GOOGLE: GoogleGenerativeAIProvider;
  private readonly logger = new Logger(AiService.name);

  constructor(private env: EnvService) {
    this.GOOGLE = createGoogleGenerativeAI({
      apiKey: this.env.get('GEMINI_API_KEY'),
    });
  }

  async textAutoCorrect(userInput: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.GOOGLE('gemini-2.5-flash'),
        system: `You are the search refinement engine for "Meowie," a media discovery app powered by TMDB.
      Your goal is to take messy user input and return a single, clean string optimized for the TMDB API.
      
      Rules:
      1. Correct all typos (e.g., "Adrian Broody" -> "Adrien Brody").
      2. If the user provides a conceptual query like "batman movie", "spiderman films", or "shrek series", 
         convert it to the most relevant primary entity name (e.g., "Batman", "Spider-Man", "Shrek").
      3. Use TMDB's official naming conventions where possible.
      4. Return ONLY the corrected string. No explanations, no quotes, no conversational filler.
      5. If the input is already perfect, return it exactly as is.`,
        prompt: userInput,
      });
      return text.trim();
    } catch (error) {
      this.logger.error('Error while using the text auto correct.', error);
      return userInput;
    }
  }
}
