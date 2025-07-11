
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'text' })
    accessToken: string;

    @Column({ type: 'text' })
    refreshToken: string;

    @CreateDateColumn()
    createdAt: Date;
}
