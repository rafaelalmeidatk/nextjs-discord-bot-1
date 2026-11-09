import type { Client, Message, MessageCreateOptions } from 'discord.js';
import type { OnMessageHandler } from '../types.ts';
import { isStaff } from '../utils.ts';
import { MOD_LOG_CHANNEL_ID, SHOWCASE_CHANNEL_ID } from '../constants.ts';
import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Next.js showcase
 * ---
 * Every new post in the showcase channel must link to a Next.js app. We treat a
 * post as valid when at least one of its links:
 * - is a public page that looks like a Next.js app (a `/_next/static/` script, or
 * - is a GitHub repository containing a `next.config.*` file.
 *
 * When we can't determine the answer (network/API errors, rate limits, etc.) we
 * leave the post alone instead of warning the author. When every link clearly
 * fails, the author gets a friendly reminder with the showcase rules and the post
 * is logged for moderators to review.
 */

const SHOWCASE_RULES_URL =
  'https://discord.com/channels/752553802359505017/1159350273056190524/1159350273056190524';

// Only read enough of a page to find the Next.js markers.
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB
const FETCH_TIMEOUT = 10_000; // 10 seconds

const URL_REGEX = /https?:\/\/[^\s<>()]+/gi;
const NEXT_CONFIG_FILE = /(^|\/)next\.config\.(?:js|mjs|cjs|ts|mts|cts)$/i;

// Matches `<script src="/base-path/_next/static/...">` without matching other
// attributes such as `data-src` or `srcset`.
const NEXT_SCRIPT = /<script\b[^>]*\ssrc\s*=\s*["'][^"']*\/_next\/static\//i;

type LinkCheck = {
  url: string;
  ok: boolean;
  reason: string;
};

const discardBody = (response: Response) => response.body?.cancel().catch(() => {});

const readTextWithLimit = async (response: Response, limit: number) => {
  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';

  while (received < limit) {
    const { done, value } = await reader.read();
    if (done) break;

    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }

  await reader.cancel().catch(() => {});
  return text + decoder.decode();
};

const isPrivateIp = (ip: string): boolean => {
  const type = net.isIP(ip);
  if (!type) return true;

  if (type === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 127 || // Loopback
      a === 10 || // Private Range
      a === 0 || // Current Network
      (a === 169 && b === 254) || // Link-local
      (a === 192 && b === 168) || // Private Range
      (a === 172 && b >= 16 && b <= 31) // Private Range
    );
  }

  const clean = ip.toLowerCase();
  return (
    clean === '::1' || // Loopback
    clean === '::' || // Unspecified
    clean.startsWith('fc') || // Unique local address
    clean.startsWith('fd') || // Unique local address
    /^fe[89ab]/.test(clean) // Link-local
  );
};

const githubRepoHasNextConfig = async (owner: string, repo: string): Promise<boolean | null> => {
  try {
    // `HEAD` resolves to the repository's default branch, so this works for `main`, `master`, etc.
    const treeResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`,
      {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: process.env.GITHUB_TOKEN
            ? `Bearer ${process.env.GITHUB_TOKEN}`
            : (undefined as any),
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }
    );

    if (treeResponse.ok) {
      const treeData = (await treeResponse.json()) as {
        tree?: { path?: string; type?: string }[];
        truncated?: boolean;
      };

      // If GitHub truncated the tree we can't be sure, so treat it as inconclusive.
      if (treeData.truncated) return null;

      return (
        treeData.tree?.some(
          (entry) =>
            entry.type === 'blob' &&
            typeof entry.path === 'string' &&
            NEXT_CONFIG_FILE.test(entry.path)
        ) ?? false
      );
    } else if (treeResponse.status === 404) {
      // Repository doesn't exist or is private, so we can't verify it.
      return false;
    }
    return null; // Treat other errors as inconclusive.
  } catch (error) {
    console.warn(`Failed to check GitHub repository ${owner}/${repo}`, error);
  }
};

const checkLink = async (url: string): Promise<LinkCheck> => {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    // Not something we can inspect, so don't punish the user for it.
    return { url, ok: true, reason: `could not parse link (${reason})` };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { url, ok: false, reason: 'not an HTTP(S) link' };
  }

  if (
    parsed.hostname === 'localhost' ||
    parsed.hostname.endsWith('.localhost') ||
    parsed.hostname.endsWith('.local')
  ) {
    return { url, ok: false, reason: 'link points to a local network address' };
  }

  if (net.isIP(parsed.hostname) === 0) {
    const lookup = await dns.lookup(parsed.hostname).catch(() => null);
    if (lookup?.address && isPrivateIp(lookup.address)) {
      return { url, ok: false, reason: 'link points to a private network address' };
    }
  }

  if (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') {
    const [owner, repo] = parsed.pathname.split('/').filter(Boolean);

    if (!owner || !repo) {
      return { url, ok: false, reason: 'not a GitHub repository link' };
    }

    const hasNextConfig = await githubRepoHasNextConfig(owner, repo.replace(/\.git$/i, ''));

    // The GitHub API didn't give us a usable answer, so don't punish the user for it.
    if (hasNextConfig === null) {
      return { url, ok: true, reason: 'could not verify the GitHub repository' };
    }

    return {
      url,
      ok: hasNextConfig,
      reason: hasNextConfig
        ? 'GitHub repository contains a next.config.* file'
        : 'no next.config.* file found in the GitHub repository',
    };
  }

  try {
    const response = await fetch(parsed.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      method: 'GET',
    });

    // If the site is down or blocks us, we can't know either way.
    if (!response.ok) {
      await discardBody(response);
      return { url, ok: true, reason: `could not fetch the link (HTTP ${response.status})` };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      await discardBody(response);
      return { url, ok: false, reason: 'link does not point to a web page' };
    }

    const html = await readTextWithLimit(response, MAX_HTML_BYTES);
    const hasNextScript = NEXT_SCRIPT.test(html);

    return {
      url,
      ok: hasNextScript,
      reason: hasNextScript
        ? 'found Next.js app markers on the page'
        : 'no Next.js app markers found on the page',
    };
  } catch {
    return { url, ok: true, reason: 'could not fetch the link' };
  }
};

const extractLinks = (content: string) => {
  const links = (content.match(URL_REGEX) ?? []).map((url) =>
    // Drop punctuation that commonly follows a URL in chat messages.
    url.replace(/[.,;:!?'"`]+$/, '')
  );

  return [...new Set(links)];
};

const buildWarningMessage = (message: Message, checks: LinkCheck[]): MessageCreateOptions => {
  const checkedLinks = checks.length
    ? checks.map((check) => `- <${check.url}>: ${check.reason}`).join('\n')
    : '- No links found in this post.';

  return {
    allowedMentions: {
      users: [message.author.id],
      repliedUser: false,
    },
    embeds: [
      {
        title: '🔎 Quick check on your showcase post',
        description: [
          `Hey 👋 Thanks for sharing your project in <#${SHOWCASE_CHANNEL_ID}>! To keep the showcase channel focused on Next.js, posts here should link to a Next.js app.`,
          '',
          "I couldn't verify that this post links to one:",
          checkedLinks,
          '',
          'Please update your post with a direct link to the deployed app or a GitHub link to the repository.',
          '',
          'This is an automated check, so it can be wrong (especially if your site is down or blocks automated requests). If you think your post already links to a Next.js app, please report it to moderators.',
          `-# Please make sure your post follows the [showcase rules](${SHOWCASE_RULES_URL}).`,
        ].join('\n'),
        color: 16098851,
      },
    ],
  };
};

const logToMods = async (client: Client, message: Message) => {
  const modLogChannel = client.channels.cache.get(MOD_LOG_CHANNEL_ID);

  if (!modLogChannel?.isSendable()) {
    console.warn(`No mod-log channel found (using the ID ${MOD_LOG_CHANNEL_ID})!`);
    return;
  }

  await modLogChannel.send({
    content: `Couldn't find a Next.js app in this showcase post: ${message.url}`,
  });
};

export const onMessage = async (client: Client, message: Message) => {
  if (message.author.bot) return;

  // Only check the initial post of a showcase forum thread, not its replies.
  if (!message.channel.isThread()) return;
  if (message.channel.parentId !== SHOWCASE_CHANNEL_ID) return;
  if (message.channel.id !== message.id) return;

  const member = await message.guild?.members.fetch(message.author.id).catch(() => null);
  if (isStaff(member)) return;

  try {
    const links = extractLinks(message.content);
    const checks = await Promise.all(links.map(checkLink));

    if (checks.some((check) => check.ok)) return;

    await message.reply(buildWarningMessage(message, checks)).catch((error) => {
      console.error('Failed to warn about a showcase post', error);
      return null;
    });

    await logToMods(client, message).catch((error) => {
      console.error('Failed to log a showcase post for the moderators', error);
    });
  } catch (error) {
    console.error('Failed to check a showcase post', error);
  }
};
