// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import { join } from 'path';
import { Invoice } from '../invoices/invoice.entity';

@Injectable()
export class PdfService {
  private readonly uploadDir = join(__dirname, '..', '..', 'uploads', 'invoices');

  constructor() {
    fs.ensureDirSync(this.uploadDir);
  }

  async generateInvoicePdf(invoice: Invoice): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fileName = `invoice-${invoice.id}-${Date.now()}.pdf`;
    const filePath = join(this.uploadDir, fileName);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Add header
    doc
      .fontSize(20)
      .text('Trade Talk', { align: 'center' })
      .moveDown();

    // Add invoice title
    doc
      .fontSize(16)
      .text(`Invoice #${invoice.id}`, { align: 'center' })
      .moveDown();

    // Add client info
    doc
      .fontSize(12)
      .text(`To: ${invoice.clientName}`)
      .moveDown();

    // Add invoice details
    doc
      .text(`Date issued: ${new Date(invoice.date).toLocaleDateString()}`)
      .moveDown();

    // Add services table
    doc
      .fontSize(14)
      .text('Service', 50, doc.y)
      .text('Amount', 400, doc.y, { width: 100, align: 'right' })
      .moveDown();

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(12)
      .text(invoice.jobDescription, 50, doc.y)
      .text(`$${invoice.amount.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' })
      .moveDown();

    // Add total
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(14)
      .text('Total', 50, doc.y)
      .text(`$${invoice.amount.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' })
      .moveDown();

    // Add footer
    doc
      .fontSize(10)
      .text('Thank you for your business!', { align: 'center' })
      .moveDown();

    // Add company info
    doc
      .text('Trade Talk', { align: 'center' })

    doc.end();

    await new Promise((resolve) => writeStream.on('finish', resolve));

    return `${fileName}`;
  }
}