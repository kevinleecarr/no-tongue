import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import {VerifyDiscordRequest, getRandomEmoji, DiscordRequest, getAppId, getGuildIds, getPublicKey} from './utils.js';
import {
  LICK_COMMAND,
  HasGuildCommands, SUDO_LICK_COMMAND,
} from './commands.js';
import {chatWithInstructions} from "./services/openai.js";
import {pretendToBe} from "./services/pretend.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(await getPublicKey()) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    if (name === LICK_COMMAND['name']) {
      let prompt = options[0].value;
      let response = await pretendToBe("a tongue", prompt);
      let content = `\"${prompt}\"

${response}`;
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: content,
        },
      });
    }

    if (name === SUDO_LICK_COMMAND['name']) {
        let instructions = options[0].value;
        let prompt = options[1].value;
        let response = await chatWithInstructions(instructions, prompt);
        let content = `\"${instructions}\"

\"${prompt}\"
  
${response}`;
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: content,
            }
        });
    }

  }
});

app.listen(PORT, async () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
    let guildIds = await getGuildIds();
    let guildIdArray = guildIds.split(",");
    // for each guild, check if commands are installed
    for (let i = 0; i < guildIdArray.length; i++) {
        await HasGuildCommands(await getAppId(), guildIdArray[i], [
            LICK_COMMAND,
            SUDO_LICK_COMMAND
        ]);
    }
});
