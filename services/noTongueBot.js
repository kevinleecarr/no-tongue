import {getMessages, saveMessages} from "./messageStore.js";
import {getPretendToBeInstructions} from "./pretend.js";
import {appendBotMessage, appendUserMessage, getMessagesForInstructionsAndPrompt, getSystemMessage} from "./openai.js";
import {chatWithMessages} from "./openai.js";

export function getDiscordConversationId(channel_id, guild_id) {
    return "DISCORD:channel_id:" + channel_id + ":guild_id:" + guild_id;
}

function getInstructions() {
    return getPretendToBeInstructions("a tongue");
}

export async function botLick(conversationId, prompt) {
    let messages = await getMessages(conversationId);
    if (!messages) {
        messages = getMessagesForInstructionsAndPrompt(
            getInstructions(),
            prompt
        );
    } else {
        messages = appendUserMessage(messages, prompt);
    }
    let response = await chatWithMessages(messages);
    messages = appendBotMessage(messages, response);
    await saveMessages(conversationId, messages);
    return response;
}

export async function resetBot(conversationId) {
    await saveMessages(conversationId, getSystemMessage(getInstructions()));
}

export async function sudoBotLick(conversationId, instructions, prompt) {
    let messages = getMessagesForInstructionsAndPrompt(
        instructions,
        prompt
    );

    let response = await chatWithMessages(messages);
    messages = appendBotMessage(messages, response);
    await saveMessages(conversationId, messages);
    return response;
}