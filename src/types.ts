import type {
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandBuilder,
  Message,
  MessageContextMenuCommandInteraction,
  MessageReaction,
  SlashCommandOptionsOnlyBuilder,
  User,
} from 'discord.js';

/* --------------------
 * Feature handlers
 */

export type OnStartupHandler = (client: Client) => Promise<void>;

export type OnMessageHandler = (
  client: Client,
  message: Message
) => Promise<void>;

export type OnReactionHandler = (
  client: Client,
  reaction: MessageReaction,
  user: User
) => Promise<void>;

/* -------------------------------------------------- */

export type FeatureFile = {
  onStartup?: OnStartupHandler;
  onMessage?: OnMessageHandler;
  onReactionAdd?: OnReactionHandler;
  onReactionRemove?: OnReactionHandler;
};

export type SlashCommand = {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
};

export type SlashCommandFile = {
  command: SlashCommand;
};

export type ContextMenuCommand = {
  data: ContextMenuCommandBuilder;
  execute: (
    interaction: MessageContextMenuCommandInteraction
  ) => void | Promise<void>;
};

export type ContextMenuCommandFile = {
  command: ContextMenuCommand;
};
