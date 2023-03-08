import { capitalize, DiscordRequest } from './utils.js';

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === '' || appId === '') return;

  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const data = await res.json();

    if (data) {
      const installedNames = data.map((c) => c['name']);
      // This is just matching on the name, so it's not good for updates
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing "${command['name']}"`);
        InstallGuildCommand(appId, guildId, command);
      } else {
        console.log(`"${command['name']}" command already installed`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: command });
  } catch (err) {
    console.error(err);
  }
}

export const LICK_COMMAND = {
  name: 'lick',
  description: 'Prompt the bot respond',
  options: [
    {
      name: 'prompt',
      description: 'The prompt to send to the bot',
      type: 3,
      required: true,
    },
  ],
  type: 1,
};

export const SUDO_LICK_COMMAND = {
  name: 'sudo_lick',
  description: 'Prompt the bot respond with instructions',
  options: [
    {
      name: 'instructions',
      description: 'The instructions',
      type: 3,
      required: true,
    },
    {
      name: 'prompt',
      description: 'The prompt to send to the bot',
      type: 3,
      required: true,
    },
  ],
  type: 1,
};

export const RESET_LICK = {
  name: 'reset_lick',
  description: 'Reset the bot',
  options: [],
  type: 1,
};

export const COMMANDS = [LICK_COMMAND, SUDO_LICK_COMMAND, RESET_LICK];