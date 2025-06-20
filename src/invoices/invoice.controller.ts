// src/invoices/invoice.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceClientDto } from './dto/invoice-client.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post('create')  // Changed to POST /invoices/create
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoiceService.create(createInvoiceDto);
    }

    @Get('client-info')  // Changed to GET /invoices/client-info
    async getClientInfoByUser(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('clientName') clientName: string,
    ): Promise<InvoiceClientDto[]> {
        return this.invoiceService.findByUserAndClient(userId, clientName);
    }
}