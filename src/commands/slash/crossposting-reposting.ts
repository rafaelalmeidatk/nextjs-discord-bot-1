import { createMentionableSlashCommand } from '../create-mentionable-slash-command';

export const command = createMentionableSlashCommand({
  name: 'crossposting-reposting',
  description: 'Replies to tell users not to crosspost/repost',
  reply: {
    title:
      'Crossposting and reposting the same question across different channels is not allowed',
    content:
      'Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.',
  },
});
