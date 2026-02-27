import { Controller, Get, Query, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { DownloadService } from './download.service.js';


@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) { }

  @Get('shipment')
  async downloadShipmentCsv(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('customer') customer: string,
    @Res() reply: FastifyReply,
  ) {
    const data = await this.downloadService.getShipmentCsvData(dateFrom, dateTo, customer);
    const csv = this.downloadService.convertToCsv(data);
    const consignee = await this.downloadService.getCustomerUsername(customer)

    const filename = `${consignee}_shipments_${dateFrom}_to_${dateTo}.csv`;

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  }

  @Get('trip')
  async downloadTripCsv(
    @Query('year') year: string,
    @Res() reply: FastifyReply,
  ) {
    const y = parseInt(year) || 2025;
    const matrix = await this.downloadService.getYearlyTripLedger(y);
    const csv = this.downloadService.formatMatrixToCsv(matrix);

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="Yearly_Ledger_${y}.csv"`)
      .send(csv);
  }
}
