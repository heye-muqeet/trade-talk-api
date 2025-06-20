// src/invoices/invoice.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { User } from '../users/users.entity';
import { Invoice } from './invoice.entity';
import { PdfService } from '../pdf/pdf.service';
import { MailerService } from '../mailer/mailer.service'; // Import your MailerService
import * as path from 'path';
import { InvoiceClientDto } from './dto/invoice-client.dto';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepo: Repository<Invoice>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private pdfService: PdfService,
        private mailerService: MailerService, // Inject MailerService
        private smsService: SmsService,
    ) { }

    async create(createDto: CreateInvoiceDto): Promise<Invoice> {
        const user = await this.userRepo.findOneBy({ id: createDto.userId });
        if (!user) throw new Error('User not found');

        const invoice = this.invoiceRepo.create({
            ...createDto,
            salesTax: createDto.salesTax || 0,
            type: createDto.type || 'invoice',
            date: createDto.date || new Date().toISOString(),
            paymentTerms: createDto.paymentTerms || 'Due upon receipt',
            createdAt: new Date(),
            user,
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);
        const pdfUrl = await this.pdfService.generateInvoicePdf(savedInvoice);
        savedInvoice.pdfUrl = pdfUrl;
        await this.invoiceRepo.save(savedInvoice);

        // Send email if client email exists
        if (savedInvoice.email && pdfUrl) {
            try {
                const fileName = pdfUrl.split('/').pop();
                if (!fileName) throw new Error('Invalid PDF URL');

                const pdfPath = path.join(
                    process.cwd(),
                    'uploads',
                    'invoices',
                    fileName,
                );

                await this.mailerService.sendInvoiceEmail(
                    savedInvoice.email,
                    savedInvoice.clientName,
                    savedInvoice.id,
                    pdfPath,
                );
            } catch (error) {
                console.error('Failed to send email:', error);
            }
        }

        if (savedInvoice.phoneNumber) {
            try {
                const publicLink = `http://192.168.1.8:3000/uploads/invoices/${pdfUrl}`; // replace with actual public file URL
                const smsText = `Hello ${savedInvoice.clientName}, your invoice #${savedInvoice.id} is ready. View it here: ${publicLink}`;

                await this.smsService.sendInvoiceSms(savedInvoice.phoneNumber, smsText);
            } catch (error) {
                console.error('Failed to send SMS:', error);
            }
        }

        return savedInvoice;
    }

    async findByUserAndClient(userId: number, clientName: string): Promise<InvoiceClientDto[]> {
        const invoices = await this.invoiceRepo.find({
            where: {
                user: { id: userId },
                clientName,
            },
            select: ['clientName', 'email', 'phoneNumber'], // Matches your entity fields
        });

        return invoices.map(invoice => ({
            name: invoice.clientName,
            email: invoice.email,
            phoneNumber: invoice.phoneNumber,
        }));
    }
}