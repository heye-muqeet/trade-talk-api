import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users') // Base path is `/api/users`
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('signup') // `/api/users/signup`
    async signup(@Body() body: { email: string; password: string }) {
        return await this.usersService.createUser(body.email, body.password);
    }

    @Post('login') // `/api/users/login`
    async login(@Body() body: { email: string; password: string }) {
        if (!body.email || !body.password) {
            throw new BadRequestException('Email and password are required');
        }

        await this.usersService.login(body.email, body.password);
        return { message: 'Verification code sent to your email' };
    }

    @Post('verify') // `/api/users/verify`
    async verify(@Body() body: { email: string; verificationCode: string }) {
        if (!body.verificationCode) {
            throw new BadRequestException('Verification code is required');
        }

        const { user, token } = await this.usersService.verifyUser(body.email, body.verificationCode);

        return {
            message: 'Account verified!',
            user,
            token
        };
    }

    @Post('send-verification-code') // Matches API.ENDPOINTS.FORGOT_PASSWORD_REQUEST_CODE
  async sendCode(@Body() body: {email: string}) {
    await this.usersService.sendVerificationCode(body.email);
    return { message: 'Verification code sent.' };
  }

    @Post('reset-password') // Matches API.ENDPOINTS.RESET_PASSWORD
  async resetPassword(@Body() body: {email: string; verificationCode: string; newPassword: string}) {
    await this.usersService.resetPassword(
      body.email,
      body.verificationCode,
      body.newPassword,
    );
    return { message: 'Password has been reset successfully.' };
  }

}
