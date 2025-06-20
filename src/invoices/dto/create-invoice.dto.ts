// src/invoices/dto/create-invoice.dto.ts
export class CreateInvoiceDto {
    clientName: string;
    jobDescription: string;
    amount: number;
    salesTax?: number;
    type?: string;
    date?: string;
    paymentTerms?: string;
    email?: string;
    phoneNumber?: string;
    userId: number; // ID of the user creating the invoice
  }
  