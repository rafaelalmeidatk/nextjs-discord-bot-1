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
import {
  crosspostingRepostingReply,
  notEnoughInfoReply,
  promotionResponse,
} from '../common-responses';
import { ContextMenuCommand } from '../../types';
import { GENERAL_CHANNEL_ID, HELP_CHANNEL_ID } from '../../constants';

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
    name: 'Not Enough Info',
    description:
      'Replies with directions for questions with not enough information',
    reply: notEnoughInfoReply,
  },
  {
    name: 'Crossposting or Reposting',
    description: 'Replies to tell users not to crosspost/repost',
    reply: crosspostingRepostingReply,
  },
  {
    name: "Don't Ask to Ask",
    reply: {
      title: "Don't ask to ask, just ask!",
      content:
        'Please just ask your question directly: <https://dontasktoask.com/>',
    },
  },
  {
    name: 'Promotion',
    description: 'Replies with the server rules for promotion',
    reply: promotionResponse,
  },
  {
    name: 'No code help in general',
    description: 'Replies to tell to use #help-forum for code help',
    reply: {
      title: 'No code help in general',
      content:
        `Since your question concerns a bug specific to your code, please open a <#${HELP_CHANNEL_ID}> post. Code-specific questions in <#${GENERAL_CHANNEL_ID}> is not allowed.`
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
