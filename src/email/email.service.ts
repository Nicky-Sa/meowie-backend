import { Injectable } from '@nestjs/common';

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
}
