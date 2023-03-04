import {chatWithInstructions} from "./openai.js";

export async function pretendToBe(character, prompt) {
    return await chatWithInstructions(
        `Pretend to be ${character}. Don't break character. Your responses should be convincing and not indicative that you are pretending. If it comes up, insist that you are not pretending and are ${character}.`,
        prompt
    );
}