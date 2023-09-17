import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ContextMenuCommand } from '../types';

type Options = {
  name: string;
  reply: {
    title: string;
    content: string;
  };
};

export const createReplyableMessageCommand = ({ name, reply }: Options) => {
  const command: ContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
      .setName(name)
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

      const requestor = interaction.user;
      const requestorAsMember = interaction.inCachedGuild()
        ? interaction.member
        : null;

      Promise.all([
        targetMessage.reply({
          embeds: [
            {
              title: reply.title,
              description: reply.content,
              footer: {
                text: `Requested by ${
                  requestorAsMember?.displayName || requestor.username
                }`,
                icon_url:
                  requestorAsMember?.displayAvatarURL() ||
                  requestor.displayAvatarURL(),
              },
            },
          ],
        }),

        interaction.reply({
          content: 'Message sent!',
          ephemeral: true,
        }),
      ]);

      // delete interaction response after 1 seconds
      setTimeout(() => {
        interaction.deleteReply();
      }, 1000);
    },
  };

  return command;
};
