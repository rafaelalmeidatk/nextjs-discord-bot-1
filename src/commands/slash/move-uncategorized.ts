import {
  ColorResolvable,
  CategoryChannel,
  ChannelType,
  Collection,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { SlashCommand } from '../../types';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('move-uncategorized')
    .setDescription('Moves uncategorized channels into a single category')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('category')
        .setDescription('The category to move the channels')
        .setRequired(true)
    ),

  async execute(interaction) {
    const { options } = interaction;

    let category: CategoryChannel;
    try {
      category = options.getChannel('category', true, [
        ChannelType.GuildCategory,
      ]);
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.name.includes('CommandInteractionOptionInvalidChannelType')
      ) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('The channel must be a category')
              .setColor('Red'),
          ],
          ephemeral: true,
        });
        return;
      }

      throw err;
    }

    const allChannels = await interaction.guild?.channels.fetch();
    const uncategorizedChannels =
      allChannels?.filter(
        (channel): channel is CategoryChannel =>
          channel?.parent === null && channel.type !== ChannelType.GuildCategory
      ) ?? new Collection();

    if (uncategorizedChannels.size === 0) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('No uncategorized channels found')
            .setColor('Red'),
        ],
        ephemeral: true,
      });
      return;
    }

    const reply = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Moving channels...')
          .setColor('Blue')
          .setDescription(
            `Moving ${uncategorizedChannels.size} channels to \`${category.name}\`...`
          ),
      ],
    });

    const res = await Promise.allSettled(
      uncategorizedChannels.map((channel) => channel.setParent(category))
    );

    const successCount = res.filter((r) => r.status === 'fulfilled').length;
    const failureCount = res.filter((r) => r.status === 'rejected').length;

    let color: ColorResolvable = 'Yellow';
    if (failureCount === 0) color = 'Green';
    if (successCount === 0) color = 'Red';

    let description = '';
    if (successCount > 0) {
      description += `Moved ${successCount} channels to \`${category.name}\`\n`;
    }
    if (failureCount > 0) {
      description += `Failed to move ${failureCount} channels`;

      console.error(
        `Failed to move ${failureCount} channels to ${category.name}:`
      );
      for (const r of res) {
        if (r.status !== 'rejected') continue;
        console.error(r.reason);
      }
    }

    await reply.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('Finished moving channels!')
          .setDescription(description)
          .setColor(color),
      ],
    });
  },
};
