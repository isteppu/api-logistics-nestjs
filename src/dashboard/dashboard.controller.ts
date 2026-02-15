import { Controller, Get, Post, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService, private prisma: PrismaService) { }

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }
}
