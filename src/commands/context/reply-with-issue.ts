import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
  reply: {
    title: string;
    content: string;
  };
};

export const responses: Option[] = [
  {
    name: 'Use #help-forum to get help',
    description: 'The #help-forum channel is the best place to ask questions',
    reply: {
      title: 'Use #help-forum for questions',
      content:
        `Got a question? Head over to the <#${HELP_CHANNEL_ID}> channel. It's our go-to spot for all your questions.`
    },
  },
  {
    name: 'Discussions',
    description: "Explains why the user doesn't have access to the discussions channel",
    reply: {
      title: 'Access to Discussions Channel',
      content: `We have limited write access to <#${DISCUSSIONS_CHANNEL_ID}>. [Learn more](https://nextjs-faq.com/on-general-being-removed)`
    }
  },
  {
    name: 'Not Enough Info',
    description: 'Replies with directions for questions with not enough information',
    reply: {
      title: 'Please add more information to your question',
      content:
        'Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292',
    },
  },
  {
    name: 'Crossposting or Reposting',
    description: 'Keep the question in one channel and wait for a response',
    reply: {
      title:
        'Crossposting and reposting the same question across different channels is not allowed',
      content:
        'Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.',
    },
  },
  {
    name: "Don't Ask to Ask",
    reply: {
      title: "Don't ask to ask, just ask!",
      content:
        'Please just ask your question directly: https://dontasktoask.com',
    },
  },
  {
    name: 'Promotion',
    description: 'Replies with the server rules for promotion',
    reply: {
      title: 'Promotion is not allowed outside the respective channels',
      content:
        `We have a few channels that allow for self-promotion (<#${SHOWCASE_CHANNEL_ID}>, <#${CONTENT_SHOWCASE_CHANNEL_ID}>). Sharing promotional links such as referral links, giveaways/contests or anything that would be a plain advertisement is discouraged and may be removed.\n\nIf what you want to share doesn't fit the promotion channels, contact a moderator to know if the post is valid before posting it.`,
    },
  },
  {
    name: 'Jobs',
    description: 'Replies with directions for job posts',
    reply: {
      title: 'Job posts are not allowed in the server',
      content: "We do not allow job posts in this server, unless it's in the context of a discussion.",
    },
  },
  {
    name: 'Ping',
    description: 'Explains why we discourage pinging other members',
    reply: {
      title: "Don't ping or DM other devs you aren't actively talking to",
      content:
        "Do not ping other people in order to get attention to your question unless they are actively involved in the discussion. If you're looking to get help, it is a lot better to post your question in a public channel so other people can help or learn from the questions",
    },
  },
  {
    name: 'No Vercel-specific questions',
    description: "Use Vercel's own GitHub discussion forum for help",
    reply: {
      title: 'Please keep this channel primarily Next.js-focused',
      content:
        `This Discord server is dedicated to all things Next.js! While we love helping out, Vercel-specific questions are best suited for the official GitHub discussion forum linked in our <#${VERCEL_HELP_CHANNEL_ID}> channel.`
    },
  }
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
              title: response.reply.title,
              description: response.reply.content,
              footer: {
                text: `Requested by ${requestorAsMember?.displayName || requestor.username}`,
                icon_url:
                  requestorAsMember?.displayAvatarURL() ||
                  requestor.displayAvatarURL(),
              },
            },
          ],
        }),

        interaction.deleteReply()
      ]);
    } catch (err) {
      console.error(err);
    }
  },
};
