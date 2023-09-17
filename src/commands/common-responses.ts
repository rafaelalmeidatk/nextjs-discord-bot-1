type Option = {
  title: string;
  content: string;
};

export const notEnoughInfoReply: Option = {
  title: 'Please add more information to your question',
  content:
    "Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292",
}

export const crosspostingRepostingReply: Option = {
  title: 'Crossposting and reposting the same question across different channels is not allowed',
  content:
    "Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.",
}

export const promotionResponse: Option = {
  title: 'Promotion is not allowed outside the respective channels',
  content:
    "We have a few channels that allow for self-promotion (<#771729272074534922>, <#1024406585012924486>). Sharing promotional links such as referral links, giveaways/contests or anything that would be a plain advertisement is discouraged and may be removed.\n\nIf what you want to share doesn't fit the promotion channels, contact a moderator to know if the post is valid before posting it.",
}
