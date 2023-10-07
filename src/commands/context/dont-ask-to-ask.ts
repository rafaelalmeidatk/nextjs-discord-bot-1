import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const command = createReplyableMessageCommand({
  name: "Don't Ask to Ask",
  reply: {
    title: "Don't ask to ask, just ask!",
    content:
      'Please just ask your question directly: <https://dontasktoask.com/>',
  },
});
