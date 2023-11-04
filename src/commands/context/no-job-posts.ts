import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ContextMenuCommand } from '../../types';
import { logAndDelete } from '../../utils';

/**
 * No Job Posts command
 * ---
 * Deletes a message and sends a DM to the user telling them to not send job posts
 */

const NAME = 'No Job Posts';

export const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName(NAME)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { targetMessage, client } = interaction;
    const originalMessageContent = targetMessage.content;

    await Promise.all([
      logAndDelete(
        client,
        targetMessage,
        `[Command] ${NAME}`,
        interaction.user
      ),
      targetMessage.author.send({
        content: `
We do not allow job posts in this server, unless it's in the context of a discussion.
Ignoring this warning will result in the account being banned from the server.
`,
        embeds: [
          {
            title: 'Deleted message:',
            description: originalMessageContent,
          },
        ],
      }),
      interaction.reply({
        ephemeral: true,
        content: 'Ok!',
      }),
    ]);
  },
};
