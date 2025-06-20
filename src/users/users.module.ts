import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { MailerService } from '../mailer/mailer.service';
import { TokensModule } from 'src/tokens/token.module';
import { Token } from 'src/tokens/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token]), TokensModule],
    providers: [UsersService, MailerService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
