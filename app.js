import 'dotenv/config';
import express from 'express';
import {InteractionResponseType, InteractionType,} from 'discord-interactions';
import {argsFromOptions, getAppId, getDiscordToken, getGuildIds, getPublicKey, VerifyDiscordRequest} from './utils.js';
import {COMMANDS, HasGuildCommands, LICK_COMMAND, RESET_LICK, SUDO_LICK_COMMAND,} from './commands.js';
import {botLick, getDiscordConversationId, resetBot, sudoBotLick} from "./services/noTongueBot.js";

// Require the necessary discord.js classes
import discord from 'discord.js';
const { Client, Events, GatewayIntentBits, REST, ROUTES } = discord;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
await client.login(await getDiscordToken());

async function command(command, interaction, handler) {
    if (interaction.commandName !== command['name']) {
        return;
    }
    await interaction.deferReply();
    await interaction.editReply(await handler(
        getDiscordConversationId(interaction.channelId, interaction.guildId),
        argsFromOptions(command, interaction))
    );
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    await command(LICK_COMMAND, interaction, async (conversationId, { prompt }) => {
        let response = await botLick(conversationId, prompt);
        return `\"${prompt}\"

${response}`;
    });

    await command(RESET_LICK, interaction, async (conversationId) => {
        let response = await resetBot(conversationId);
        return 'done';
    });

    await command(SUDO_LICK_COMMAND, interaction, async (conversationId, { instructions, prompt }) => {
        let response = await sudoBotLick(conversationId, instructions, prompt);
        return `\"${instructions}\"

\"${prompt}\"
  
${response}`;
    });
});

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(await getPublicKey()) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

app.listen(PORT, async () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
    let guildIds = await getGuildIds();
    let guildIdArray = guildIds.split(",");
    // for each guild, check if commands are installed
    for (let i = 0; i < guildIdArray.length; i++) {
        await HasGuildCommands(await getAppId(), guildIdArray[i], COMMANDS);
    }
});
