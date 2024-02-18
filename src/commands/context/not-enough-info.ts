import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const notEnoughInfoReply = {
  title: 'Please add more information to your question',
  content:
    'Your question lacks sufficient details. Please add code snippets by using [codeblocks](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline#h_01GY0DAKGXDEHE263BCAYEGFJA), a reproduction repository, or detailed error messages. For guidance on asking a good question, visit https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292.',
};

export const command = createReplyableMessageCommand({
  name: 'Not Enough Info',
  reply: notEnoughInfoReply,
});
