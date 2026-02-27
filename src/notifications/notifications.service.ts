import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NotificationItems } from './models/notification-item.model.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface TelegramMessage {
  messageId: number;
  refId: string;
  name: string;
  details: string;
  usernames: string[];
  readersStatus: Record<string, boolean>; // tracks read per username
  telegramMessage: any,
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) { }
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  private telegramMessages: Record<number, TelegramMessage> = {};

  async getAdminUsernames() {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { title: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      },
      select: { username: true },
    });

    return admins;
  }

  async sendAlert(type: NotificationItems, usernames: string[]) {
    const adminUsernames = await this.getAdminUsernames();
    const allUsernames = [...new Set([...usernames, ...adminUsernames.map(a => a.username)])];

    const readersStatus: Record<string, boolean> = {};
    allUsernames.forEach(u => (readersStatus[u] = false));

    const text = this.formatMessage(type, allUsernames, readersStatus);
    const resp: any = await this.sendToTelegram(text, type.id);

    this.telegramMessages[resp.data.result.message_id] = {
      messageId: resp.data.result.message_id,
      refId: type.id,
      name: type.name,
      details: type.details,
      usernames: allUsernames,
      readersStatus,
      telegramMessage: resp.data.result,
    };

    return resp;
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

  async markAsRead(messageId: number, username: string) {
    const msg = this.telegramMessages[messageId];
    if (!msg) return;

    if (msg.usernames.includes(username)) {
      msg.readersStatus[username] = true;

      const updatedText = this.formatMessage(
        { id: msg.refId, name: msg.name, details: msg.details },
        msg.usernames,
        msg.readersStatus
      );

      this.telegramMessages[messageId].readersStatus = msg.readersStatus;
      await this.editTelegramMessage(messageId, updatedText, msg.refId);
    }
  }

  getNotificationsByUser(username: string) {
    return Object.values(this.telegramMessages)
      .filter(msg => msg.usernames.includes(username))
      .map(msg => {
        return {
          update_id: msg.messageId,
          callback_query: {
            id: `fake-callback-${msg.messageId}`,
            from: { username },
            message: msg.telegramMessage, 
            data: `read_${msg.refId}`,
          }
        };
      });
  }
}