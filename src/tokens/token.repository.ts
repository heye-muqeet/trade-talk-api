import { EntityRepository, Repository } from 'typeorm';
import { Token } from './token.entity';

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
    async saveToken(userId: number, accessToken: string, refreshToken: string): Promise<Token> {
        const token = this.create({ user: { id: userId }, accessToken, refreshToken });
        return await this.save(token);
    }

    async findTokenByUser(userId: number): Promise<Token | null> {
        return await this.findOne({ where: { user: { id: userId } } });
    }

    async deleteTokensForUser(userId: number): Promise<void> {
        await this.delete({ user: { id: userId } });
    }
}
