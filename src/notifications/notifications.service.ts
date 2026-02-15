import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationGateway } from './notifications.gateway.js';

@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private gateway: NotificationGateway
    ) { }

    async blastNotification(message: string, type: string, refId: string, senderId: string) {
        return 1;
        // return this.prisma.$transaction(async (tx) => {
        //     const note = await tx.notification.create({
        //         data: { message, type, reference_id: refId }
        //     });

        //     const targetUsers = await tx.user.findMany();

        //     const userNotes = targetUsers.map(u => ({
        //         user_id: u.id,
        //         notification_id: note.id,
        //         is_read: false
        //     }));

        //     await tx.user_notification.createMany({ data: userNotes });

        //     this.gateway.server.emit('refreshNotifications', {
        //         newNotification: message,
        //         type: type,
        //         targetUserIds: targetUsers.map(u => u.id)
        //     });

        //     return note;
        // });
    }

    async getMyNotifications(userId: string) {
        const userNotes = await this.prisma.user_notification.findMany({
            where: { user_id: userId },
            include: {
                notification: true,
            },
            orderBy: {
                notification: { created_at: 'desc' },
            },
            take: 20,
        });

        return userNotes.map((un) => ({
            id: un.notification.id,
            message: un.notification.message,
            type: un.notification.type,
            reference_id: un.notification.reference_id,
            is_read: un.is_read,
            date: un.notification.created_at,
            user_id: userId
        }));

    }

    async markAsRead(userId: string, notificationId: number) {
        return this.prisma.user_notification.update({
            where: {
                user_id_notification_id: {
                    user_id: userId,
                    notification_id: notificationId,
                },
            },
            data: {
                is_read: true,
                read_at: new Date()
            },
        });
    }

}