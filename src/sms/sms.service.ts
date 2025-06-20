import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendInvoiceSms(to: string, message: string): Promise<void> {
    await this.client.messages.create({
      body: message,
      from: this.configService.get('TWILIO_PHONE_NUMBER'), // e.g., "+1234567890"
      to,
    });
  }
}
