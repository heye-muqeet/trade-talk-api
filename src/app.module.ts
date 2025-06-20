import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; // 👈 import this
import { join } from 'path'; // 👈 import this

import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { MailerService } from './mailer/mailer.service';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { Token } from './tokens/token.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceModule } from './invoices/invoice.module';
import { SmsService } from './sms/sms.service';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      entities: [User, Token, Invoice],
      synchronize: true,
    }),
    
    // 👇 serve /uploads folder publicly
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    UsersModule,
    AuthModule,
    CalendarModule,
    InvoiceModule,
    SmsModule
  ],
  providers: [MailerService, SmsService],
  exports: [SmsService],
})
export class AppModule {}
