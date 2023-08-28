import { crosspostingRepostingReply } from '../common-responses';
import { createMentionableSlashCommand } from '../create-mentionable-slash-command';

export const command = createMentionableSlashCommand({
  name: 'crossposting-reposting',
  description: 'Replies to tell users not to crosspost/repost',
  reply: crosspostingRepostingReply
});
