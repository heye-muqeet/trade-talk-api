import { Controller, Get, Query, Redirect, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Redirect User to Google Login
   */
  @Get('google')
  @Redirect()
  async redirectToGoogle() {
    return { url: this.authService.getGoogleAuthURL() };
  }

  /**
   * Handle Google OAuth Callback
   */
  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    console.log('🔹 Received Callback');
    if (!code) {
      console.error('❌ No Code Found');
      throw new BadRequestException('Authorization code is missing');
    }

    console.log('🔹 Authorization Code:', code);

    try {
      const tokens = await this.authService.getGoogleTokens(code);
      console.log('✅ Tokens:', tokens);

      return res.json({
        message: "Auth success!",
        access_token: tokens.access_token
      });      
    } catch (error) {
      console.error('❌ Google Auth Error:', error);
      return res.status(500).json({ message: 'Google Auth failed', error: error.message });
    }
  }
}
