import { Configuration, OpenAIApi } from "openai";
import {getOpenAiKey} from "../utils.js";

import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// Instantiates a client
const client = new SecretManagerServiceClient();

export async function chatWithInstructions(instructions, prompt, n = 1) {
    let openai = new OpenAIApi(new Configuration({
        apiKey: await getOpenAiKey()
    }));

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: instructions},
                {role: "user", content: prompt}
            ],
            n: n,
        });
        return completion.data.choices[0].message.content;
    } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
        }
        return '...';
    }
}

