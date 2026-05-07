import {
  PermissionFlagsBits,
  CheckboxGroupBuilder,
  CheckboxGroupOptionBuilder,
  RadioGroupBuilder,
  ModalBuilder,
  LabelBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  MediaGalleryItemBuilder,
  MediaGalleryBuilder,
  ComponentType,
  ActionRowBuilder,
  InteractionContextType,
  type APISelectMenuOption,
  type InteractionReplyOptions,
  MessagePayload,
  type Channel,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import type { ContextMenuCommand } from '../../types.ts';
import {
  SHOWCASE_CHANNEL_ID,
  CONTENT_SHOWCASE_CHANNEL_ID,
  HELP_CHANNEL_ID,
  VERCEL_HELP_CHANNEL_ID,
  DISCUSSIONS_CHANNEL_ID,
} from '../../constants.ts';

type Option = {
  name: string;
  description?: string;
  reply: { title: string; description: string; image?: string };
  category?: Categories;
};

type Categories = 'wrong-place' | 'message-help' | 'other';

export const categories: Record<Categories, { title: string; description?: string }> = {
  'wrong-place': {
    title: 'Wrong Place',
    description: 'Help the user understand they are in the wrong channel/place.',
  },
  'message-help': {
    title: 'Message Help',
    description: 'Provide assistance with how the user can improve their messages.',
  },
  other: {
    title: 'Other Helpful Options',
  },
};

export const responses: Option[] = [
  {
    name: 'Use #help-forum to get help',
    description: 'The #help-forum channel is the best place to ask questions',
    category: 'wrong-place',
    reply: {
      title: 'Use #help-forum for questions',
      description: `Got a question? Head over to the <#${HELP_CHANNEL_ID}> channel. It's our go-to spot for all your questions.`,
    },
  },
  {
    name: 'Discussions',
    description: "Explains why the user doesn't have access to the discussions channel",
    category: 'wrong-place',
    reply: {
      title: 'Access to Discussions Channel',
      description: `We have limited write access to <#${DISCUSSIONS_CHANNEL_ID}>. You need to be active in the <#${HELP_CHANNEL_ID}> channel to gain write access. [Learn more](https://nextjs-faq.com/on-general-being-removed). `,
    },
  },
  {
    name: 'Not Enough Info',
    description: 'Replies with directions for questions with not enough information',
    category: 'message-help',
    reply: {
      title: 'Please add more information to your question',
      description:
        'Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292.',
    },
  },
  {
    name: 'Crossposting or Reposting',
    description: 'Keep the question in one channel and wait for a response',
    category: 'wrong-place',
    reply: {
      title:
        'Crossposting and reposting the same question across different channels is not allowed',
      description:
        'Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.',
    },
  },
  {
    name: 'Improve Forum Question Title',
    description: 'Tell the user to update their question title to make it more descriptive',
    category: 'message-help',
    reply: {
      title: 'Please improve the title of your question',
      description:
        'To ensure you get the best possible assistance, could you please change your thread title to be more descriptive? Specific titles attract the attention of users who can help and make it easier for others to find similar solutions in the future. You can change the title by going to `•••` → `Edit Post` → `Post Title`.',
    },
  },
  {
    name: 'Use Code Blocks',
    category: 'message-help',
    reply: {
      title: 'Please use code blocks',
      description: [
        'When sharing code or error messages, please use code blocks.',

        'You can create a code block by wrapping your code in three backticks (\\`), like this: \n> \\`\\`\\`ts \n> code here\n> \\`\\`\\`',
        'You can also specify the language in the code block (e.g. `ts`, `js`) to enable syntax highlighting:  ```ts\nexport default function Page(){}\n```',
        '* Link a Gist to upload entire files: https://gist.github.com/',
        '* Link a Code Sandbox to share runnable examples: https://codesandbox.io/s',
        '* Link a Code Sandbox to an existing GitHub repo: `https://codesandbox.io/s/github/<username>/<reponame>`',
      ].join('\n'),
      image: 'https://c.tenor.com/AYdCjUfOD78AAAAC/tenor.gif',
    },
  },
  {
    name: "Don't Ask to Ask",
    category: 'message-help',
    reply: {
      title: "Don't ask to ask, just ask!",
      description: 'Please just ask your question directly: https://dontasktoask.com.',
    },
  },
  {
    name: 'Explain Why a Help Post is not Answered',
    description: "Explain why a post wasn't answered and provide next steps.",
    category: 'message-help',
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
    name: 'Mark answer',
    description: 'Explains how to mark an answer as the solution',
    reply: {
      title: 'Mark an answer as the solution',
      description: [
        'To mark the message as solution:',
        '1. Hover over the message you want to mark as the solution.',
        '2. Right click the message Click the three dots that appear on the right side. ',
        "3. You'll see a menu which should have the option of `Apps`. Hover Over it.",
        '4. Click on the `Mark as Answer` option.',
        "Note: If you don't see the `Mark as Answer` option or `Apps` option, restart/update your discord app! ",
      ].join('\n'),
      image:
        'https://cdn.discordapp.com/attachments/1043615796787683408/1117191182133501962/image.png',
    },
  },
  {
    name: 'Promotion',
    description: 'Replies with the server rules for promotion',
    category: 'wrong-place',
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
    category: 'wrong-place',
    reply: {
      title: 'Job posts are not allowed in the server',
      description: [
        `We do not allow job posts in this server, unless it's in the context of a discussion.`,
        `You may check the latest official job threads in the Vercel Community: https://community.vercel.com/tag/hiring`,
      ].join('\n'),
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
    category: 'wrong-place',
    reply: {
      title: 'Please keep the content primarily Next.js-focused',
      description: `This Discord server is dedicated to all things Next.js, and is not a Vercel support server. Vercel-specific questions are best suited for the official Vercel community at https://vercel.community. See more resources at <#${VERCEL_HELP_CHANNEL_ID}>.`,
    },
  },
];

// cache of last 10 previous responses to avoid duplicates
const responsesCache = [] as `${string}-${string}`[]; // msgId-responseNum

export const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Reply with issue...')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { targetMessage } = interaction;

    // mainly for type safety
    if (!interaction.isMessageContextMenuCommand()) return;

    if (
      targetMessage.author.id === interaction.applicationId &&
      targetMessage.interactionMetadata?.user.id === interaction.user.id
    ) {
      // only allow <1min to avoid killing history
      if (Date.now() - targetMessage.createdTimestamp > 60 * 1000) {
        interaction.reply({
          content: 'You can only delete this reply within the first minute after sending it.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const reply = await interaction.reply({
        content: 'Would you like to delete this reply?',
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('deleteReplyWithIssue')
              .setLabel('Delete')
              .setStyle(ButtonStyle.Danger)
          ),
        ],
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });

      try {
        const newInteraction = await reply.resource?.message?.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 0.5 * 60 * 1000,
          filter: (i) => i.user.id === interaction.user.id,
        });
        if (newInteraction) {
          await newInteraction.update({
            content: 'Reply deleted.',
            components: [],
          });

          await targetMessage.delete();
          setTimeout(() => newInteraction.deleteReply().catch(() => null), 2500);
        }
      } catch (err) {
        if (
          (err as any)?.code === 'InteractionCollectorError' &&
          (err as any)?.toString?.().includes('time')
        ) {
          await interaction.deleteReply().catch(() => {});
        } else {
          console.error(err);
        }
      }

      return;
    }

    if (targetMessage.author.bot) {
      interaction.reply({
        content: 'You cannot reply to a bot message',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const modal = new ModalBuilder().setCustomId('replyWithIssue').setTitle('Reply with Issue');

    const categoryCheckboxOptions = {} as Record<
      Categories | 'other',
      CheckboxGroupOptionBuilder[]
    >;

    for (const response of responses) {
      const category = response.category || 'other';
      if (!categoryCheckboxOptions[category]) {
        categoryCheckboxOptions[category] = [];
      }

      const option = new CheckboxGroupOptionBuilder()
        .setLabel(response.name)
        .setValue(response.name);
      if (response.description) option.setDescription(response.description);

      categoryCheckboxOptions[category].push(option);
    }

    for (const [category, options] of Object.entries(categoryCheckboxOptions)) {
      const categoryInfo = categories[category as Categories] || categories.other;
      const label = new LabelBuilder().setLabel(categoryInfo.title).setCheckboxGroupComponent(
        new CheckboxGroupBuilder()
          .setCustomId('replyWithIssue:' + category)
          .setOptions(options)
          .setRequired(false)
      );
      if (categoryInfo.description) label.setDescription(categoryInfo.description);

      modal.addLabelComponents(label);
    }

    let modOnlyOptions = [] as APISelectMenuOption[];
    if (interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      modOnlyOptions.push({
        label: 'Delete their message',
        value: 'delete-msg',
      });
      modOnlyOptions.push({
        label: 'Delete their message & DM',
        value: 'delete-msg:dm',
      });
    }
    if (
      interaction.memberPermissions?.has(PermissionFlagsBits.ManageThreads) &&
      targetMessage.channel.isThread() &&
      targetMessage.channel.ownerId === targetMessage.author.id
    ) {
      modOnlyOptions.push({
        label: 'Delete their thread & DM',
        value: 'delete-thread:dm',
      });
    }
    if (modOnlyOptions.length) {
      modal.addLabelComponents(
        new LabelBuilder()
          .setLabel('Mod only options')
          .setRadioGroupComponent(
            new RadioGroupBuilder()
              .setCustomId('mod-only-options')
              .addOptions(modOnlyOptions)
              .setRequired(false)
          )
      );
    }
    await interaction.showModal(modal);

    try {
      // wait for a a chosen option
      const newInteraction = await interaction.awaitModalSubmit({
        time: 5 * 60 * 1000, // 5 minutes (more than enough time)
        filter: (i) => i.user.id === interaction.user.id,
      });

      const repliesChosen = [] as string[];
      for (const category of Object.keys(categories)) {
        repliesChosen.push(...newInteraction.fields.getCheckboxGroup('replyWithIssue:' + category));
      }
      const chosenResponses = responses.filter((r) => repliesChosen.includes(r.name));
      if (chosenResponses.length === 0) {
        await newInteraction.reply({
          content: 'No responses selected, not replying.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      } else if (chosenResponses.length > 3) {
        await newInteraction.reply({
          content: 'You can only select up to 3 responses.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const modOptions = newInteraction.fields.getRadioGroup('mod-only-options');
      const deleteMessage =
        (modOptions === 'delete-msg:dm' || modOptions === 'delete-msg') &&
        newInteraction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
      const deleteThread =
        modOptions === 'delete-thread:dm' &&
        newInteraction.memberPermissions?.has(PermissionFlagsBits.ManageThreads) &&
        targetMessage.channel.isThread() &&
        targetMessage.channel.ownerId === targetMessage.author.id;
      const dmMemberInstead =
        (deleteMessage || deleteThread) &&
        modOptions.endsWith(':dm') &&
        newInteraction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);

      if (!modOptions) {
        // if response already sent recently, do not send again
        // unless this time there are extra responses selected
        const _chosenResponses = chosenResponses.filter(
          (r) => !responsesCache.includes(`${targetMessage.id}-${r.name}`)
        );
        if (!chosenResponses.length || chosenResponses.length !== _chosenResponses.length) {
          newInteraction.reply({
            content: 'Someone has already sent those responses recently!',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      const getParentChannelUrl = (channel: Channel) => {
        if (channel.isThread() && channel.parent) return channel.parent.url;
        return channel.url;
      };

      const message = {
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          users: [targetMessage.author.id],
        },
        components: [
          dmMemberInstead &&
            new TextDisplayBuilder().setContent(
              `Your ${deleteThread ? 'thread' : 'message'} in ${
                deleteThread
                  ? getParentChannelUrl(interaction.targetMessage.channel)
                  : interaction.targetMessage.channel.url
              } **was deleted** because it was against the rules.` +
                `\n> ${interaction.targetMessage.content.slice(0, 500).split('\n').join('\n> ')}` +
                `\n\nPlease see the helpful tips below it to improve your future messages:`
            ),

          ...chosenResponses.map((option) => {
            const container = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${option.reply.title}`)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `<@${targetMessage.author.id}> ${option.reply.description}`
                )
              );
            if (option.reply.image) {
              container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                  new MediaGalleryItemBuilder().setURL(option.reply.image)
                )
              );
            }
            return container;
          }),
        ].filter((e) => !!e),
      } satisfies InteractionReplyOptions | MessagePayload;

      if (dmMemberInstead) {
        const success = await newInteraction.user.send(message).catch(() => false);
        if (!success) {
          await newInteraction.reply({
            content: 'Failed to send DM. They might have DMs from server members disabled.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        } else {
          await newInteraction.reply({
            content: 'Sent the response in DM!',
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        await newInteraction.reply(message);
      }

      chosenResponses.map(({ name }) => responsesCache.push(`${targetMessage.id}-${name}`));
      responsesCache.length = Math.min(responsesCache.length, 10);

      if (deleteThread && targetMessage.channel.isThread()) {
        await targetMessage.channel.delete(
          `Deleted by @${interaction.user.username} using Reply with Issue context menu command`
        );
      } else if (deleteMessage) {
        await targetMessage.delete();
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
