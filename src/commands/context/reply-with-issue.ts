import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  APIEmbed,
} from 'discord.js';
import { ContextMenuCommand } from '../../types';
import {
  SHOWCASE_CHANNEL_ID,
  CONTENT_SHOWCASE_CHANNEL_ID,
  HELP_CHANNEL_ID,
  VERCEL_HELP_CHANNEL_ID,
  DISCUSSIONS_CHANNEL_ID,
} from '../../constants';

type Option = {
  name: string;
  description?: string;
  emoji?: string;
  reply: APIEmbed;
};

export const responses: Option[] = [
  {
    name: 'Use #help-forum to get help',
    description: 'The #help-forum channel is the best place to ask questions',
    reply: {
      title: 'Use #help-forum for questions',
      description: `Got a question? Head over to the <#${HELP_CHANNEL_ID}> channel. It's our go-to spot for all your questions.`,
    },
  },
  {
    name: 'Discussions',
    description:
      "Explains why the user doesn't have access to the discussions channel",
    reply: {
      title: 'Access to Discussions Channel',
      description: `We have limited write access to <#${DISCUSSIONS_CHANNEL_ID}>. You need to be active in the <#${HELP_CHANNEL_ID}> channel to gain write access. [Learn more](https://nextjs-faq.com/on-general-being-removed). `,
    },
  },
  {
    name: 'Not Enough Info',
    description:
      'Replies with directions for questions with not enough information',
    reply: {
      title: 'Please add more information to your question',
      description:
        'Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292.',
    },
  },
  {
    name: 'Crossposting or Reposting',
    description: 'Keep the question in one channel and wait for a response',
    reply: {
      title:
        'Crossposting and reposting the same question across different channels is not allowed',
      description:
        'Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.',
    },
  },
  {
    name: 'Improve Forum Question Title',
    description:
      'Tell the user to update their question title to make it more descriptive',
    reply: {
      title: 'Please improve the title of your question',
      description:
        'To ensure you get the best possible assistance, could you please change your thread title to be more descriptive? Specific titles attract the attention of users who can help and make it easier for others to find similar solutions in the future. You can change the title by going to `•••` → `Edit Post` → `Post Title`.',
    },
  },
  {
    name: 'Use Code Blocks',
    reply: {
      title: 'Please use code blocks',
      description: [
        'When sharing code or error messages, please use code blocks.',

        'You can create a code block by wrapping your code in three backticks (\\`), like this: \n> \\`\\`\\`ts \n> code here\n> \\`\\`\\`',
        'You can also specify the language in the code block (e.g. `ts`, `js`) to enable syntax highlighting:  ```ts\nexport default function Page(){}\n```',
        'Link a Gist to upload entire files: https://gist.github.com/',
        'Link a Code Sandbox to share runnable examples: https://codesandbox.io/s',
        'Link a Code Sandbox to an existing GitHub repo: https://codesandbox.io/s/github/<username>/<reponame>',
      ].join('\n'),
      image: {
        url: 'https://media1.tenor.com/images/a23c33a91cb8d026b83488f1673495fd/tenor.gif?itemid=27632534',
      },
    },
  },
  {
    name: "Don't Ask to Ask",
    reply: {
      title: "Don't ask to ask, just ask!",
      description:
        'Please just ask your question directly: https://dontasktoask.com.',
    },
  },
  {
    name: 'Explain Why a Help Post is not Answered',
    description: "Explain why a post wasn't answered and provide next steps.",
    reply: {
      title: 'Why your post might not have received answers.',
      description: [
        'People who help here are all volunteers, they are not paid so not required to attend to any forum posts. So if a post doesn’t have a response, there are four possible cases:',
        '1. People who may help have not been active yet or did not find the question. In this case you can bump the question later to make it float up the channel so those people might be able to see it. Don’t do it more than once per day.',
        '2. No one can answer, usually because the question concerns technologies that are too niche or the question is too hard. For example, many people are not able to help with questions about hosting on very niche platforms.',
        '3. The question is bad. Following the “resources for good questions” in https://discord.com/channels/752553802359505017/1138338531983491154 will help you avoid this third scenario.',
        '4. The question is too long. Keep it concise please, people who help may not have sufficient spare time and energy to read through a help request that is too long.',
      ].join('\n\n'),
    },
  },
  {
    name: "Mark answer",
    description: "Explains how to mark an answer as the solution",
    reply: {
      title: "Mark an answer as the solution",
      description: [
        "To mark the message as solution:",
        "1. Hover over the message you want to mark as the solution.",
        "2. Right click the message Click the three dots that appear on the right side. ",
        "3. You'll see a menu which should have the option of `Apps`. Hover Over it.",
        "4. Click on the `Mark as Answer` option.",
        "Note: If you don't see the `Mark as Answer` option or `Apps` option, restart/update your discord app! "
      ].join("\n"),
      image: {
        url: 'https://cdn.discordapp.com/attachments/1043615796787683408/1117191182133501962/image.png',
      },
    }
  },
  {
    name: 'Promotion',
    description: 'Replies with the server rules for promotion',
    reply: {
      title: 'Promotion is not allowed outside the respective channels',
      description: [
        `We have a few channels that allow for self-promotion: <#${SHOWCASE_CHANNEL_ID}> exclusively for Next.js applications and <#${CONTENT_SHOWCASE_CHANNEL_ID}> for general web development-related content. Sharing promotional links such as referral links, giveaways/contests or anything that would be a plain advertisement is discouraged and may be removed.`,
        `If what you want to share doesn't fit the promotion channels, contact a moderator to know if the post is valid before posting it.`,
      ].join('\n\n'),
    },
  },
  {
    name: 'Jobs',
    description: 'Replies with directions for job posts',
    reply: {
      title: 'Job posts are not allowed in the server',
      description: [
        `We do not allow job posts in this server, unless it's in the context of a discussion.`,
        `You may check the latest official job threads in the Vercel Community: https://community.vercel.com/tag/hiring`
      ].join("\n"),
    },
  },
  {
    name: 'Ping',
    description: 'Explains why we discourage pinging other members',
    reply: {
      title: "Don't ping or DM other devs you aren't actively talking to",
      description:
        "Do not ping other people in order to get attention to your question unless they are actively involved in the discussion. If you're looking to get help, it is a lot better to post your question in a public channel so other people can help or learn from the questions.",
    },
  },
  {
    name: 'No Vercel-specific questions',
    description: "Use Vercel's official community forum for Vercel help",
    reply: {
      title: 'Please keep the content primarily Next.js-focused',
      description: `This Discord server is dedicated to all things Next.js, and is not a Vercel support server. Vercel-specific questions are best suited for the official Vercel community at https://vercel.community. See more resources at <#${VERCEL_HELP_CHANNEL_ID}>.`,
    },
  },
];

// select menu generated here because it will be the same every time
const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>();
const selectMenu = new StringSelectMenuBuilder()
  .setCustomId('replyWithIssue')
  .setPlaceholder('Choose the response that will be the most help');

actionRow.addComponents(selectMenu);

for (const response of responses) {
  const option = new StringSelectMenuOptionBuilder()
    .setLabel(response.name)
    .setValue(response.name);

  if (response.description) option.setDescription(response.description);
  if (response.emoji) option.setEmoji({ name: response.emoji });

  selectMenu.addOptions(option);
}

export const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Reply with issue...')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { targetMessage } = interaction;

    // mainly for type safety
    if (!interaction.isMessageContextMenuCommand()) return;

    if (targetMessage.author.bot) {
      interaction.reply({
        content: 'You cannot reply to a bot message',
        ephemeral: true,
      });
      return;
    }

    const interactionReply = await interaction.reply({
      components: [actionRow],
      ephemeral: true,
    });

    try {
      // wait for a a chosen option
      const newInteraction = await interactionReply.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 5 * 60 * 1000, // 5 minutes (more than enough time)
        filter: (i) => i.user.id === interaction.user.id,
      });

      const requestor = interaction.user;
      const requestorAsMember = interaction.inCachedGuild()
        ? interaction.member
        : null;

      const replyChosen = newInteraction.values[0];
      const response = responses.find((r) => r.name == replyChosen);

      if (!response) {
        newInteraction.reply({
          content: 'Unknown reply option',
          ephemeral: true,
        });
        return;
      }

      Promise.all([
        targetMessage.reply({
          embeds: [
            {
              ...response.reply,
              footer: {
                text: `Requested by ${requestorAsMember?.displayName || requestor.username}`,
                icon_url:
                  requestorAsMember?.displayAvatarURL() ||
                  requestor.displayAvatarURL(),
              },
            },
          ],
        }),

        interaction.deleteReply(),
      ]);
    } catch (err) {
      console.error(err);
    }
  },
};
