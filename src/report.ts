import { Client, Guild, Message, User } from "discord.js";
import { isStaff } from "./utils";

// We will keep a memory cache of warned messages to avoid showing multiple warnings
const warnedMessageIds: string[] = [];

/** Returns `true` if the message was sent successfully, and `false` if there was an error */
export default async function reportMessage(
  client: Client,
  guild: Guild,
  message: Message,
  reporter: User,
  urgent = false,
  title = '⚠️ Message Reported'
): Promise<boolean> {
  if (warnedMessageIds.includes(message.id)) {
    // Send the success message anyway so they know the mods have been notified
    return true;
  }

  const channel = client.channels.cache.get(process.env.MOD_LOG_CHANNEL_ID);

  if (!channel || !channel.isTextBased()) {
    console.error(
      `No mod-log channel found (using the ID ${process.env.MOD_LOG_CHANNEL_ID})!`
    );

    return false;
    // interaction.reply({
    //     content: 'Something went wrong, please try again later',
    //     ephemeral: true,
    // });
  }

  const author = await guild.members.fetch(message.author.id);
  const userGuildMember = await guild.members.fetch(reporter.id);
  const isUserStaff = isStaff(userGuildMember);

  channel.send({
    content: !isUserStaff && urgent
      ? `<@&${process.env.MODERATOR_ROLE_ID}>`
      : undefined,
    embeds: [
      {
        title,
        description: '```' + message.content + '```',
        color: 0xf5a623,
        author: {
          name: author.displayName,
          icon_url: author.displayAvatarURL(),
        },
        fields: [
          {
            name: 'Author',
            value: `<@${message.author.id}>`,
            inline: true,
          },
          {
            name: 'Channel',
            value: `<#${message.channelId}>`,
            inline: true,
          },
          {
            name: 'Jump to message',
            value: `[Click here](${message.url})`,
            inline: true,
          },
        ],
        footer: {
          icon_url: userGuildMember.displayAvatarURL(),
          text: `Reported by ${userGuildMember.displayName}`,
        },
      },
    ],
  });

  warnedMessageIds.push(message.id);

  return true
}