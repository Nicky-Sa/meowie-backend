import { Injectable } from '@nestjs/common';
import { EmailTemplateConfig } from './email.types';

@Injectable()
export abstract class EmailService {
  protected constructor() {}

  abstract sendEmail(
    to: string,
    template: {
      name: string;
      data: Record<string, string>;
    },
  ): Promise<void>;

  abstract syncTemplates(config: EmailTemplateConfig): Promise<void>;

  abstract ping(): Promise<void>;
}
