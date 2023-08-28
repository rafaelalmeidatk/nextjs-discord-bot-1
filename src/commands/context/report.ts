import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ContextMenuCommand } from '../../types';
import reportMessage from '../../report';

/**
 * Report message command
 * ---
 * Logs a message in the mod log channel. If a normal user uses the command it will ping the mods
 */


export const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Report')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { client, guild, user, targetMessage } = interaction;

    if (!guild) return;

    if (targetMessage.author.id === user.id) {
      // Stop this way of pinging mods for code help plz
      interaction.reply({
        content: 'You cannot report your own message',
        ephemeral: true,
      });
      return;
    }

    const reportResult = await reportMessage(client, guild, targetMessage, user, true)

    if (reportResult === true) {
      interaction.reply({
        content:
          'Thanks, the message has been reported and the moderators have been notified',
        ephemeral: true,
      });

    } else {
      interaction.reply({
        content: 'Something went wrong, please try again later',
        ephemeral: true,
      });
    }
  },
};
