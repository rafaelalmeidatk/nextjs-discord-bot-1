import path from 'node:path';
import fs from 'node:fs';
import type { SlashCommandFile, ContextMenuCommandFile } from './types.ts';
import { isJsOrTsFile } from './utils.ts';

const slashDir = path.resolve(import.meta.dirname, './commands/slash');
const slashFiles = fs.readdirSync(slashDir).filter(isJsOrTsFile);
export const slashCommands = await Promise.all(
  slashFiles.map(async (file) => {
    const { command } = (await import(`./commands/slash/${file}`)) as SlashCommandFile;
    return command;
  })
);

const contextDir = path.resolve(import.meta.dirname, './commands/context');
const contextFiles = fs.readdirSync(contextDir).filter(isJsOrTsFile);
export const contextMenuCommands = await Promise.all(
  contextFiles.map(async (file) => {
    const { command } = (await import(`./commands/context/${file}`)) as ContextMenuCommandFile;
    return command;
  })
);

export const allCommands = () => {
  return [...slashCommands, ...contextMenuCommands];
};
