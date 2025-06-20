// src/sms/sms.module.ts
import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [SmsService],
    exports: [SmsService], // 👈 export it so other modules can use it
})
export class SmsModule { }
