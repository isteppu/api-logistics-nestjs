import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';

@Controller('webhooks/telegram')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async handleUpdate(@Body() update: any) {
    // 1. Handle Button Clicks (Callback Queries)
    if (update.callback_query) {
      const callback = update.callback_query;
      const message = callback.message;
      const userWhoClicked = callback.from.first_name;
      const callbackData = callback.data; // e.g., "read_shipment_ID123"

      if (callbackData.startsWith('read_shipment_')) {
        const shipmentId = callbackData.replace('read_shipment_', '');
        const currentText = message.text;

        // 2. Simple check: Is this user already in the list?
        if (currentText.includes(`Read by ${userWhoClicked}`)) {
          // Send an alert to the user's phone saying they already read it
          return { ok: true }; 
        }

        // 3. Logic: Extract current list and append new reader
        // For DB-less, we just append to the string
        const updatedStatus = currentText.includes('No one has read this yet') 
          ? `✅ Read by ${userWhoClicked}`
          : `${currentText.split('Acknowledge Status:')[1].trim()}\n✅ Read by ${userWhoClicked}`;

        const newFullText = `📦 <b>NEW Shipment!</b>\n` + 
                            `<b>ID:</b> <code>${shipmentId}</code>\n` +
                            `... (re-format from parts) ...\n\n` +
                            `<b>Acknowledge Status:</b>\n${updatedStatus}`;

        // In a real scenario, you'd parse the text more carefully or use the shipment ID to re-fetch data
        // For simplicity, let's just append to the message text:
        const finalMessage = currentText.replace('<i>No one has read this yet.</i>', '') + `\n✅ Read by ${userWhoClicked}`;

        await this.notificationService.editTelegramMessage(
          message.message_id,
          finalMessage,
          shipmentId
        );
      }
    }
    return { ok: true };
  }
}