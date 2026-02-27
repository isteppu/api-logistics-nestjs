import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service.js';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @Get("monthly_sales/:year")
  async getSales(
    @Param('year') year: number,
  ) {
    return await this.auditService.getMonthlySales(year)
  }
}
