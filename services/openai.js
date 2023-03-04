import {Configuration, OpenAIApi} from "openai";
import {getOpenAiKey} from "../utils.js";

export function getMessagesForInstructionsAndPrompt(instructions, prompt) {
    return [
        {role: "system", content: instructions},
        {role: "user", content: prompt}
    ];
}

const MAX_MESSAGES_PER_CONVERSATION = 100;

function truncate(messages) {
    return messages.slice(0, 1).concat(messages.slice(1).slice(0 - MAX_MESSAGES_PER_CONVERSATION));
}

export function appendUserMessage(messages, prompt) {
    messages.push({role: "user", content: prompt});
    return truncate(messages);
}

export function appendBotMessage(messages, prompt) {
    messages.push({role: "assistant", content: prompt});
    return truncate(messages);
}

export async function chatWithMessages(messages, nOptions) {
    let openai = new OpenAIApi(new Configuration({
        apiKey: await getOpenAiKey()
    }));

    console.log(messages);
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            n: nOptions,
        });
        if (nOptions === 1) {
            return completion.data.choices[0].message.content;
        } else {
            return completion.data.choices.map(choice => choice.message.content);
        }
    } catch (error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
        }
        return '...';
    }
}

export async function chatWithInstructions(instructions, prompt, nOptions = 1) {
    let messages = getMessagesForInstructionsAndPrompt(instructions, prompt);
    return await chatWithMessages(messages, nOptions);
}

export async function evaluateAsYesNo(question, nTimes = 1) {
    let messages = getMessagesForInstructionsAndPrompt(
        "You are an evaluator. You will be asked a question. You must answer the question with 'Yes.' 'No.' or 'N/A:'.",
        question
    );

    return await chatWithMessages(messages, nTimes);
}
