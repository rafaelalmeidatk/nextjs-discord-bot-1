import { crosspostingRepostingReply } from '../common-responses';
import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const command = createReplyableMessageCommand({
  name: 'Crossposting or Reposting',
  botAllowed: false,
  reply: crosspostingRepostingReply,
  report: {
    title: "Reported crossposted/reposted message",
    urgent: false
  }
});
