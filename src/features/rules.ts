import { TextChannel } from 'discord.js';
import { OnStartupHandler } from '../types';
import {
  FEEDBACK_CHANNEL_ID,
  DISCUSSIONS_CHANNEL_ID,
  HELP_CHANNEL_ID,
  OFFTOPIC_CHANNEL_ID,
  RULES_CHANNEL_ID,
  SHOWCASE_CHANNEL_ID,
} from '../constants';

/**
 * Rules module
 * ---
 * When the bot starts, it will post the rules defined below into the configured channel.
 * To avoid spamming the channel everytime it is started, the messages existing in the channel
 * are going to be "recycled". This means that if we edit something in the rules, we will try to edit
 * the existing messages to avoid creating pings in the channel.
 */

const RULES_MESSAGES = [
  'https://cdn.discordapp.com/attachments/574725363922501719/1108130187503227005/nextjs.png',
  `
‎
👋 Welcome to the official Next.js Discord server! This is the place to chat about Next.js, ask questions, show off your projects, and collaborate with other developers.

📖 We abide by our Code of Conduct. Please read it: <https://github.com/vercel/next.js/blob/canary/CODE_OF_CONDUCT.md>

✨ Customize your profile in <id:customize> by adding your own name color or custom roles

## 🔍 Here's a quick breakdown of our most popular channels:

<#${HELP_CHANNEL_ID}> — Ask for help with Next.js
<#${SHOWCASE_CHANNEL_ID}> — Show off your Next.js projects
<#${DISCUSSIONS_CHANNEL_ID}> — Engage in more in-depth and advanced discussions about Next.js (you can chat in the channel after being active in <#${HELP_CHANNEL_ID}>)
<#${OFFTOPIC_CHANNEL_ID}> — Anything else you want to talk about

## 📜 Server Rules

1. Be friendly, patient, and courteous of people's time and space. Do NOT directly ping/DM or annoy any member/moderators/etc.
2. Be respectful. You can disagree, but this cannot be allowed to turn into a personal attack.
3. No spamming, trolling, advertising, or job postings. This applies to both chats and the DMs of members here.
4. Use the channels provided properly by reading their descriptions. Moderators are free to delete any messages posted in the wrong channel.
5. No NSFW, political, religious, job-related, or unrelated content or discussions that don't align with the community's purpose. This includes profile pictures, usernames, and any other content.
6. Do not cross-post the same question on multiple channels, including linking the message on other channels.

Most importantly, use common sense and keep in mind that this list of rules isn't exhaustive; please listen to what our moderators say.
If you see something against the rules or something that makes you feel unsafe, let the staff know. We want this server to be a welcoming space!
We are always looking to improve the server. Feel free to share your ideas or opinions in <#${FEEDBACK_CHANNEL_ID}>
`,
  `
## ✍️ Tips to get help faster

1. Don't ask to ask, just ask: <https://dontasktoask.com>
2. If you are facing an error, share the full error message and what you think might be causing it
3. Always try to add this to your questions when applicable: "What are you expecting to happen?", "What is happening instead?", "What have you tried?"
4. Include the relevant dependencies you are working with. \`npx next info\` will give you a list to get you started
5. Share the project or a minimal reproduction of the issue, this allows people to investigate better the problem

More tips: <https://stackoverflow.com/help/how-to-ask>
`,
];

export const onStartup: OnStartupHandler = async (client) => {
  const channel = client.channels.cache.get(RULES_CHANNEL_ID) as TextChannel;

  if (!channel) {
    console.warn(
      `No rules channel found (using the ID ${RULES_CHANNEL_ID}), skipping the rules module!`
    );
    return;
  }

  const channelMessages = await channel.messages.fetch({ limit: 100 });

  // Filter only the messages from the bot
  const channelMessagesFromBot = channelMessages.filter(
    (m) => m.author.id === client.user?.id
  );

  // Sort the messages from oldest to newest (so they match the same order of the rules)
  const channelMessagesReversed = [
    ...channelMessagesFromBot.values(),
  ].reverse();

  // For each message sent in the channel...
  for (let i = 0; i < channelMessagesReversed.length; i++) {
    const message = channelMessagesReversed[i];

    // We first check if there is no rule message matching this position,
    // this means that we have more messages in the channel than in our rules, so
    // we need to delete this message (and this is going to be true to all the next messages)
    if (!RULES_MESSAGES[i]) {
      await message.delete();
      continue;
    }

    // If the content of the message doesn't match the respective message in the rules, edit it
    if (message.content !== RULES_MESSAGES[i]) {
      await message.edit(RULES_MESSAGES[i]);
    }
  }

  // And in the end, check if there are more messages in the rules than in the channel,
  // this means that we didn't have enough messages to edit so we need to create more
  const messagesLeftToCreate =
    RULES_MESSAGES.length - channelMessagesReversed.length;

  if (messagesLeftToCreate > 0) {
    // Grab the last n messages from the rules...
    const remainingMessages = RULES_MESSAGES.slice(
      Math.max(RULES_MESSAGES.length - messagesLeftToCreate, 0)
    );

    // And create them!
    await Promise.all(
      remainingMessages.map((message) => channel.send(message))
    );
  }
};
