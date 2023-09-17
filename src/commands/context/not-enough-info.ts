import { notEnoughInfoReply } from '../common-responses';
import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const command = createReplyableMessageCommand({
  name: 'Not Enough Info',
  reply: notEnoughInfoReply,
});
