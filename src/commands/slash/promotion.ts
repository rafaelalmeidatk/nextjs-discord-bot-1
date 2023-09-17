import { promotionResponse } from '../common-responses';
import { createMentionableSlashCommand } from '../create-mentionable-slash-command';

export const command = createMentionableSlashCommand({
  name: 'promotion',
  description: 'Replies with the server rules for promotion',
  reply: promotionResponse,
});
