// src/invoices/invoice.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { User } from 'src/users/users.entity';
import { PdfModule } from 'src/pdf/pdf.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, User]), PdfModule, MailerModule, SmsModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
