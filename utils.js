import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// Instantiates a client
const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [secret] = await client.accessSecretVersion({
    name: process.env.GOOGLE_SECRET_MANAGER_KEY_PREFIX + name + "/versions/latest",
  });

  return secret.payload.data.toString('utf8');
}

export async function getAppId() {
  return getSecret('DISCORD_APP_ID');
}

export async function getGuildIds() {
  return getSecret('DISCORD_GUILD_ID');
}

export async function getDiscordToken() {
  return getSecret('DISCORD_TOKEN');
}
export async function getPublicKey() {
  return getSecret('DISCORD_PUBLIC_KEY');
}

export async function getOpenAiKey() {
  return getSecret('OPEN_API_KEY');
}

export function argsFromOptions(command, interaction) {
  return command.options.reduce((acc, option) => ({ ...acc, [option.name]: interaction.options.getString(option.name) }), {});
}

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${await getDiscordToken()}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

