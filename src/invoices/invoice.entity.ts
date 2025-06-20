// src/invoices/invoice.entity.ts
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clientName: string;

    @Column()
    jobDescription: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    salesTax: number;

    @Column({ default: 'invoice' })
    type: string;

    @Column({ type: 'timestamp' })
    date: string;

    @Column({ default: 'Due upon receipt' })
    paymentTerms: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    pdfUrl: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
}
