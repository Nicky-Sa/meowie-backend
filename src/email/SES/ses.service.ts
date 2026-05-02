import { EmailService } from '../email.service';
import {
  SendTemplatedEmailCommand,
  SESClient,
  UpdateTemplateCommand,
  CreateTemplateCommand,
  GetSendQuotaCommand,
} from '@aws-sdk/client-ses';
import { EnvService } from '../../env/env.service';
import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplateConfig } from '../email.types';

@Injectable()
export class SesService extends EmailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(SesService.name);

  constructor(private readonly env: EnvService) {
    super();
    this.sesClient = new SESClient({
      // For local development, we need to provide credentials and region,
      // but for production, it will use IAM role attached to the runner
      ...(this.env.get('BUILD_ENV') === 'development' && {
        region: this.env.get('AWS_REGION'),
        credentials: {
          accessKeyId: this.env.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.env.get('AWS_SECRET_ACCESS_KEY'),
        },
      }),
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
      this.logger.error('Failed to send email: ', error);
      throw error;
    }
  }

  async syncTemplates(config: EmailTemplateConfig) {
    const templateData = {
      Template: {
        TemplateName: config.templateName,
        SubjectPart: config.subject,
        HtmlPart: config.htmlContent,
        TextPart: config.textContent,
      },
    };

    try {
      await this.sesClient.send(new UpdateTemplateCommand(templateData));
      this.logger.log(
        `✅ Template "${config.templateName}" updated successfully in AWS SES.`,
      );
    } catch (error: any) {
      if (
        error instanceof Error &&
        error.name === 'TemplateDoesNotExistException'
      ) {
        await this.sesClient.send(new CreateTemplateCommand(templateData));
        this.logger.log(
          `✨ Template "${config.templateName}" created in AWS SES.`,
        );
      } else {
        this.logger.error('❌ Error syncing template to SES:', error);
      }
    }
  }

  async ping(): Promise<void> {
    await this.sesClient.send(new GetSendQuotaCommand({}));
  }
}
