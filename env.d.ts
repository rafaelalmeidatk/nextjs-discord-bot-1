declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Required env variables
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      MOD_LOG_CHANNEL_ID: string;

      // Optional env variables
      GITHUB_TOKEN?: string;
    }
  }
}

export {};
