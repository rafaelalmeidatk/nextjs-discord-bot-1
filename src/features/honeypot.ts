import type { OnMessageHandler } from '../types.ts';
import { isStaff, logAndDelete } from '../utils.ts';
import { HONEYPOT_CHANNEL_ID, MOD_LOG_CHANNEL_ID } from '../constants.ts';

/**
 * Honeypot Channel Feature
 * ---
 * If anyone besides a moderator sends a message in the honeypot channel, they get auto banned
 */

export const onMessage: OnMessageHandler = async (client, message) => {
  if (message.channel.id !== HONEYPOT_CHANNEL_ID || message.author.bot) return;

  const messageAuthor = await message.guild?.members.fetch(message.author.id);
  if (!messageAuthor || isStaff(messageAuthor)) return;

  try {
    await messageAuthor.ban({
      reason: 'Posted in honeypot channel',
      deleteMessageSeconds: 3600, // 1h
    });

    const modLogChannel = client.channels.cache.get(MOD_LOG_CHANNEL_ID);
    if (!modLogChannel?.isSendable()) {
      console.warn(`No mod-log channel found (using the ID ${MOD_LOG_CHANNEL_ID})!`);
      return;
    }

    await modLogChannel.send({
      embeds: [
        {
          title: '🍯 Honeypot Ban',
          description: `User <@${message.author.id}> was banned for posting in the honeypot channel`,
          color: 16098851,
          fields: [
            {
              name: 'Message',
              value: message.content ? `\`\`\`${message.content}\`\`\`` : '*No text content*',
            },
          ],
        },
      ],
    });

    console.log(
      `Banned user ${message.author.username} (${message.author.id}) for posting in honeypot channel`
    );
  } catch (error) {
    console.error('Error banning user from honeypot channel:', error);

    // If for some reason we can't ban, at least delete the message and log it
    await logAndDelete(client, message, 'Honeypot channel violation (ban failed)');
  }
};
