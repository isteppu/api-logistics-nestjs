import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';
import { NotificationsGateway } from './notifications.gateway.js';

@Controller('webhooks/telegram')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService, private notificationsGateway: NotificationsGateway) {}

  @Post()
  async handleUpdate(@Body() update: any) {
    if (update.callback_query) {
      const callback = update.callback_query;
      const message = callback.message;
      const userWhoClicked = callback.from.first_name;
      const callbackData = callback.data;

      if (callbackData.startsWith('read_')) {
        const refId = callbackData.replace('read_', '');
        const currentText = message.text;

        if (currentText.includes(`Read by ${userWhoClicked}`)) {
          return { ok: true }; 
        }

        const updatedStatus = currentText.includes('No one has read this yet') 
          ? `✅ Read by ${userWhoClicked}`
          : `${currentText.split('Acknowledge Status:')[1].trim()}\n✅ Read by ${userWhoClicked}`;

        const log = `📦 <b>Notif Update!</b>\n` + 
                            `<b>ID:</b> <code>${refId}</code>\n` +
                            `... (re-format from parts) ...\n\n` +
                            `<b>Acknowledge Status:</b>\n${updatedStatus}`;

        console.log(log);

        const finalMessage = currentText.replace('<i>No one has read this yet.</i>', '') + `\n✅ Read by ${userWhoClicked}`;

        await this.notificationService.editTelegramMessage(
          message.message_id,
          finalMessage,
          refId
        );

        this.notificationsGateway.sendSyncEvent({
            name: refId,
            user: userWhoClicked,
            type: 'ACKNOWLEDGED'
          });
      }
    }
    return { ok: true };
  }
}