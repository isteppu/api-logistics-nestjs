import { Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private notificationService: NotificationService,
        private prisma: PrismaService
    ) { }

    @Get()
    async getNotifications(@Query('userId') userId: string) {
        return this.notificationService.getMyNotifications(userId);
    }

    @Get('unread-count')
    async getMyUnreadCount(@Req() req: any) {
        const userId = req.user.id;
        const count = await this.prisma.user_notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });
        return { count };
    }

    @Post('read-all')
    async markAllAsRead(@Req() req: any) {
        const userId = req.user.id;
        await this.prisma.user_notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true, read_at: new Date() }
        });
        return { success: true };
    }

    @Patch(':id/read')
    async markRead(
        @Param('id', ParseIntPipe) id: number,
        @Query('userId') userId: string,
    ) {
        return this.notificationService.markAsRead(userId, id);
    }
}

