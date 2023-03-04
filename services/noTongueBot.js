import {getMessages, saveMessages} from "./messageStore.js";
import {getPretendToBeInstructions} from "./pretend.js";
import {appendBotMessage, appendUserMessage, getMessagesForInstructionsAndPrompt} from "./openai.js";
import {chatWithMessages} from "./openai.js";

export async function botLick(conversationId, prompt) {
    let messages = await getMessages(conversationId);
    if (!messages) {
        messages = getMessagesForInstructionsAndPrompt(
            getPretendToBeInstructions("a tongue"),
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