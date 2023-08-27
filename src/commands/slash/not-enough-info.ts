import { notEnoughInfoReply } from '../common-responses';
import { createMentionableSlashCommand } from '../create-mentionable-slash-command';

export const command = createMentionableSlashCommand({
  name: 'not-enough-info',
  description:
    'Replies with directions for questions with not enough information',
  reply: notEnoughInfoReply,
});
