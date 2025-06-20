// src/pdf/pdf.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs-extra';

@Controller('invoices/download')
export class PdfController {
  private readonly uploadDir = join(__dirname, '..', '..', 'uploads', 'invoices');

  @Get(':filename')
  async servePdf(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(this.uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${filename}`);
      return fs.createReadStream(filePath).pipe(res);
    }
    
    return res.status(404).send('File not found');
  }
}