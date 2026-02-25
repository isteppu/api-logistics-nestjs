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
    @Res() reply: FastifyReply,
  ) {
    const data = await this.downloadService.getShipmentCsvData(dateFrom, dateTo);
    const csv = this.downloadService.convertToCsv(data);

    const filename = `shipments_${dateFrom}_to_${dateTo}.csv`;

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  }

  @Get('trip')
  async downloadTripCsv(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Res() reply: FastifyReply,
  ) {
    const data = await this.downloadService.getTripCsvData(dateFrom, dateTo);
    const csv = this.downloadService.convertToCsv(data);

    const filename = `trips_${dateFrom}_to_${dateTo}.csv`;

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  }
}
