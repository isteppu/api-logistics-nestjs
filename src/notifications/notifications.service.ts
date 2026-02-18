import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  /**
   * Sends a new shipment notification with an inline "Mark as Read" button.
   */
  async sendShipmentAlert(shipment: any) {
    const text = this.formatShipmentMessage(shipment, []);
    return this.sendToTelegram(text, shipment.id);
  }

  /**
   * Formats the HTML message. 
   * 'readers' is an array of names who already clicked the button.
   */
  formatShipmentMessage(shipment: any, readers: string[]) {
    let text = `📦 <b>NEW Shipment!</b>\n`;
    text += `<b>ID:</b> <code>${shipment.id}</code>\n`;
    text += `<b>BL No:</b> ${shipment.blno}\n`;
    text += `<b>Port:</b> ${shipment.port || 'N/A'}\n\n`;
    
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
          [{ text: "👁️ Mark as Read", callback_data: `read_shipment_${refId}` }],
          [{ text: "🔗 Open Dashboard", url: `https://your-app.com/shipment?search=${refId}` }]
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
          [{ text: "👁️ Mark as Read", callback_data: `read_shipment_${refId}` }],
          [{ text: "🔗 Open Dashboard", url: `https://your-app.com/shipment?search=${refId}` }]
        ]
      }
    });
  }
}