import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const command = createReplyableMessageCommand({
  name: "Don't Ask to Ask",
  botAllowed: false,
  reply: {
    title: "Don't ask to ask, just ask!",
    content:
      "Please ask your question directly. If someone knows the answer, they will reply. If you don't get an answer, you can try again later.\n\nAlso see: <https://dontasktoask.com/>",
  },
});
