import { Module } from '@nestjs/common';
import { DownloadService } from './download.service.js';
import { DownloadController } from './download.controller.js';

@Module({
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
