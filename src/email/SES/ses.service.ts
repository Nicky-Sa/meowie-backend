import { EmailService } from '../email.service';
import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { EnvService } from '../../env/env.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SesService extends EmailService {
  private sesClient: SESClient;

  constructor(private readonly env: EnvService) {
    super();
    this.sesClient = new SESClient({
      region: this.env.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.env.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendEmail(
    to: string,
    template: {
      name: string;
      data: Record<string, string>;
    },
  ): Promise<void> {
    const params = {
      Source: `Meowie <${this.env.get('SENDER_EMAIL')}>`,
      Destination: { ToAddresses: [to] },
      Template: template.name,
      TemplateData: JSON.stringify(template.data),
    };

    try {
      await this.sesClient.send(new SendTemplatedEmailCommand(params));
    } catch (error) {
      console.error('Failed to send email: ', error);
      throw error;
    }
  }
}
