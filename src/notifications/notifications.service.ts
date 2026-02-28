import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NotificationItems } from './models/notification-item.model.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) { }

  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async getAdminUsernames(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: { title: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
      select: { username: true },
    });
    return admins.map(a => a.username);
  }

  async sendAlert(type: NotificationItems, usernames: string[]) {
    const adminUsernames = await this.getAdminUsernames();
    const allUsernames = [...new Set([...usernames, ...adminUsernames])];

    const readersStatus: Record<string, boolean> = {};
    allUsernames.forEach(u => (readersStatus[u] = false));

    const text = this.formatMessage(type, allUsernames, readersStatus);
    const resp: any = await this.sendToTelegram(text, type.id);

    const notif = await this.prisma.notification.create({
      data: {
        refId: type.id,
        type: type.name,
        title: type.name,
        details: type.details,
        telegramId: resp.data.result.message_id,
        usernames: allUsernames.join(','),
        readersStatus: JSON.stringify(readersStatus), // ✅ serialize here
      },
    });

    return notif;
  }

  formatMessage(
    type: { id: string; name: string; details: string },
    usernames: string[],
    readersStatus: Record<string, boolean>
  ) {
    let text = `📦 <b>NEW ${type.name}!</b>\n`;
    text += `<b>ID:</b> <code>${type.id}</code>\n`;
    text += `<b>Details:</b> ${type.details}\n\n`;
    text += `<b>Acknowledge Status:</b>\n`;
    text += usernames
      .map(u => (readersStatus[u] ? `- ${u}: ✅ Read` : `- ${u}: Mark as Read`))
      .join('\n');
    return text;
  }

  async sendToTelegram(text: string, refId: string) {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    return axios.post(url, {
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👁️ Mark as Read', callback_data: `read_${refId}` }],
          [{ text: '🔗 Open Dashboard', url: `https://your-app.com/?search=${refId}` }],
        ],
      },
    });
  }

  async editTelegramMessage(messageId: number, text: string, refId: string) {
    const url = `https://api.telegram.org/bot${this.botToken}/editMessageText`;
    return axios.post(url, {
      chat_id: this.chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👁️ Mark as Read', callback_data: `read_${refId}` }],
          [{ text: '🔗 Open Dashboard', url: `https://your-app.com/?search=${refId}` }],
        ],
      },
    });
  }

  async markAsRead(telegramId: number, username: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { telegramId },
    });
    if (!notif) return;

    // ✅ deserialize readersStatus
    const readers: Record<string, boolean> = JSON.parse(notif.readersStatus);

    if (readers[username] !== undefined) {
      readers[username] = true;

      // ✅ serialize before saving
      await this.prisma.notification.update({
        where: { id: notif.id },
        data: { readersStatus: JSON.stringify(readers) },
      });

      const text = this.formatMessage(
        { id: notif.refId, name: notif.title, details: notif.details },
        notif.usernames.split(','),
        readers
      );
      await this.editTelegramMessage(telegramId, text, notif.refId);
    }
  }

  async getNotificationsByUser(username: string) {
    const notifs = await this.prisma.notification.findMany({
      where: { usernames: { contains: username } },
    });

    return notifs.map(n => ({
      date: n.createdAt,
      rawData: {
        update_id: n.telegramId,
        callback_query: {
          id: `fake-callback-${n.telegramId}`,
          from: { username },
          message: { telegramId: n.telegramId, title: n.title, details: n.details },
          data: `read_${n.refId}`,
        },
      }
    }));
  }
}