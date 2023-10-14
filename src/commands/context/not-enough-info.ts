import { createReplyableMessageCommand } from '../create-replyable-message-command';

export const notEnoughInfoReply = {
  title: 'Please add more information to your question',
  content:
    'Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292',
};

export const command = createReplyableMessageCommand({
  name: 'Not Enough Info',
  reply: notEnoughInfoReply,
});
