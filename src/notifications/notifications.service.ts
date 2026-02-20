import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NotificationItems } from './models/notification-item.model.js';

@Injectable()
export class NotificationService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async sendAlert(type: NotificationItems) {
    const text = this.formatMessage(type, []);
    return this.sendToTelegram(text, type.id);
  }

  formatMessage(type: NotificationItems, readers: string[]) {
    let text = `📦 <b>NEW ${type.name}!</b>\n`;
    text += `<b>ID:</b> <code>${type.id}</code>\n`;
    text += `<b>Details:</b> ${type.details}\n`;
    
    text += `<b>Acknowledge Status:</b>\n`;
    if (readers.length === 0) {
      text += `<i>No one has read this yet.</i>`;
    } else {
      text += readers.map(name => `✅ Read by ${name}`).join('\n');
    }

    return text;
  }

  async sendToTelegram(text: string, refId: string) {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    return axios.post(url, {
      chat_id: this.chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "👁️ Mark as Read", callback_data: `read__${refId}` }],
          [{ text: "🔗 Open Dashboard", url: `https://your-app.com/?search=${refId}` }]
        ]
      }
    });
  }

  async blastNotification(text: string, type: string, id: string, userid?:string) {
    return 1;
  }

  async editTelegramMessage(messageId: number, text: string, refId: string) {
    const url = `https://api.telegram.org/bot${this.botToken}/editMessageText`;
    return axios.post(url, {
      chat_id: this.chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "👁️ Mark as Read", callback_data: `read__${refId}` }],
          [{ text: "🔗 Open Dashboard", url: `https://your-app.com/?search=${refId}` }]
        ]
      }
    });
  }
}