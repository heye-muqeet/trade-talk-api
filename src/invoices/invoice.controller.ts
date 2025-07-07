// src/invoices/invoice.controller.ts
import { Controller, Post, Get, Body, Query, Patch } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceClientDto } from './dto/invoice-client.dto';
import { ParseIntPipe } from '@nestjs/common';
import { UpdateStatusDto} from './dto/update-invoice-status.dto'


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

    @Get('pdf-urls')
    async getPdfUrlsForUser(@Query('userId', ParseIntPipe) userId: number) {
        return this.invoiceService.getInvoicesForUser(userId);
    }

    @Get('quotes')
    async getquotesForUser(@Query('userId', ParseIntPipe) userId: number){
        return this.invoiceService.getquotesForUser(userId);
    }

    // NEW ENDPOINT: PATCH /invoices/update-status
    @Patch('update-status')
    async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
        const { invoiceId, userId, status } = updateStatusDto;
        return this.invoiceService.updateInvoiceStatus(invoiceId, userId, status);
    }


}