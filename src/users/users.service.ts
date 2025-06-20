import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './users.entity';
import { MailerService } from '../mailer/mailer.service';
import { TokenRepository } from '../tokens/token.repository';
import { Token } from 'src/tokens/token.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Token) private tokenRepository: Repository<Token>,
        private readonly mailerService: MailerService,
    ) { }

    async createUser(email: string, password: string): Promise<User> {
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration time (5 minutes from now)
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 5);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt: expirationTime,
        });

        await this.usersRepository.save(user);
        await this.mailerService.sendVerificationEmail(email, verificationCode);

        return user;
    }

    async sendVerificationCode(email: string): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 5);

        user.verificationCode = verificationCode;
        user.verificationCodeExpiresAt = expirationTime;
        await this.usersRepository.save(user);

        await this.mailerService.sendVerificationEmail(email, verificationCode);
    }

    async verifyUser(email: string, verificationCode: string): Promise<{ user: any; token: { accessToken: string; refreshToken: string } }> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user || user.verificationCode !== verificationCode) {
            throw new BadRequestException('Invalid verification code');
        }
    
        if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
            throw new BadRequestException('Verification code expired');
        }
    
        // Generate Tokens
        const accessToken = jwt.sign({ userId: user.id }, 'ACCESS_SECRET', { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, 'REFRESH_SECRET', { expiresIn: '7d' });
    
        // Save tokens in the database
        const token = this.tokenRepository.create({ user, accessToken, refreshToken });
        await this.tokenRepository.save(token);
    
        return {
            user,
            token: {
                accessToken,
                refreshToken
            }
        };
    }
    

    async login(email: string, password: string): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.sendVerificationCode(email);
    }
}
