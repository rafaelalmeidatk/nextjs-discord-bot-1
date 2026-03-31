import {
  SlashCommandBuilder,
  InteractionContextType,
  ModalBuilder,
  LabelBuilder,
  TextInputStyle,
  TextInputBuilder,
  FileUploadBuilder,
  CheckboxBuilder,
  AttachmentBuilder,
  MessageFlags,
  TextDisplayBuilder,
  SectionBuilder,
} from 'discord.js';
import { SlashCommand } from '../../types';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription(
      'Send a report to the moderators. Opens a modal to fill out the report.'
    )
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const { client, guild, user } = interaction;

    if (!guild) return;

    const modal = new ModalBuilder()
      .setCustomId('reportModal')
      .setTitle('Send a report')
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Title')
          .setDescription('Give your report a clear and concise title')
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('title')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder('Spam DMs from a user')
              .setMaxLength(100)
          ),
        new LabelBuilder()
          .setLabel('Description')
          .setDescription('Provide a detailed explanation of the issue')
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('description')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setPlaceholder('I want to report a user who is spamming DMs...')
              .setMaxLength(4000)
          ),
        new LabelBuilder()
          .setLabel('Attachments (optional)')
          .setDescription('Describe the issue you want to report in detail')
          .setFileUploadComponent(
            new FileUploadBuilder()
              .setCustomId('attachments')
              .setRequired(false)
              .setMaxValues(5)
          ),
        new LabelBuilder()
          .setLabel('Urgent')
          .setDescription(
            'Is this issue urgent and requires immediate attention from the moderators?'
          )
          .setCheckboxComponent(new CheckboxBuilder().setCustomId('urgent'))
      );

    await interaction.showModal(modal);

    try {
      // wait for the report
      const newInteraction = await interaction.awaitModalSubmit({
        time: 10 * 60 * 1000, // 10 minutes (more than enough time)
        filter: (i) => i.user.id === interaction.user.id,
      });

      const title = newInteraction.fields.getTextInputValue('title');
      const description =
        newInteraction.fields.getTextInputValue('description');
      const attachments = newInteraction.fields.getUploadedFiles('attachments');
      const urgent = newInteraction.fields.getCheckbox('urgent');

      const channel = client.channels.cache.get(process.env.MOD_LOG_CHANNEL_ID);

      if (!channel || !channel.isSendable()) {
        console.error(
          `No mod-log channel found (using the ID ${process.env.MOD_LOG_CHANNEL_ID})!`
        );

        interaction.reply({
          content: 'Something went wrong, please try again later',
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      // the extra time of downloading and reuploading attachments may take > 3sec
      if (attachments && attachments?.size > 0) {
        await newInteraction.deferReply({ flags: MessageFlags.Ephemeral });
      }

      const userMember = await guild.members.fetch(user.id).catch(() => null);

      const files = attachments
        ? await Promise.all(
            attachments.map(async (attachment, index) => {
              const response = await fetch(attachment.url);
              const buffer = await response.arrayBuffer();
              return new AttachmentBuilder(Buffer.from(buffer), {
                name: `${index}_${attachment.name}`,
                description:
                  attachment.description ?? 'Uploaded file from user',
              });
            })
          )
        : undefined;

      const imageExtentions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      const imageAttachments = files?.filter((att) =>
        imageExtentions.some((ext) => att.name?.endsWith(ext))
      );

      await channel.send({
        content: urgent ? `<@&${process.env.MODERATOR_ROLE_ID}>` : undefined,
        embeds: [
          {
            title: '⚠️ New Report: ' + title,
            description: description,
            color: 16098851,
            author: {
              name: (userMember || user).displayName ?? 'Unknown user',
              icon_url: (userMember || user).displayAvatarURL(),
            },
            image: imageAttachments?.[0]
              ? { url: `attachment://${imageAttachments[0].name}` }
              : undefined,
            // url needed so that it "groups" many attachments together and shows a nice gallery if there are multiple images, instead of showing them as separate embeds
            url:
              imageAttachments && imageAttachments.length > 1
                ? `https://discord.com/user/${user.id}`
                : undefined,
          },
          ...(imageAttachments && imageAttachments.length > 1
            ? imageAttachments.slice(1).map((file, index) => ({
                url: `https://discord.com/user/${user.id}`,
                image: {
                  url: `attachment://${file.name}`,
                },
              }))
            : []),
        ],
        files,
      });

      if (newInteraction.deferred) {
        await newInteraction.editReply({
          content:
            'Your report has been submitted to the moderators. Thank you for helping us keep the community safe!',
        });
      } else {
        await newInteraction.reply({
          content:
            'Your report has been submitted to the moderators. Thank you for helping us keep the community safe!',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      if (
        (err as any)?.code === 'InteractionCollectorError' &&
        (err as any)?.toString()?.includes('time')
      )
        return;
      console.error(err);
    }
  },
};
