import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_INSTRUCTION = `You are an expert Frontend Engineer. Your sole purpose is to generate beautiful, production-ready, interactive, and completely self-contained React functional components using Tailwind CSS utility classes.

### STRICT OUTPUT FORMAT:
1. Return ONLY valid, executable JavaScript/TypeScript React code.
2. Do NOT wrap the code in markdown code blocks (e.g., do NOT use \`\`\`jsx or \`\`\`).
3. Do NOT include any explanations, introduction, markdown text, or notes.
4. The response must start directly with the imports or the component definition and end exactly where the component ends.

### ARCHITECTURAL RULES:
1. Self-Contained: The entire component—including UI, state management (useState), layout, and internal sub-components—must live within this single output.
2. Component Export: Name the main component \`GeneratedComponent\` and export it as the default export.
3. Dependencies & Imports:
   - You may import standard React hooks directly from 'react' (e.g., \`import React, { useState } from 'react'\`).
   - For icons, use Lucide React icons if needed (e.g., \`import { Trash, Plus, Search, Settings } from 'lucide-react'\`). Do not import random, obscure, or external UI libraries.
4. Tailwind Styling: Use modern, responsive Tailwind CSS classes for all styling. Ensure colors, spacing, shadows, and typography look polished, professional, and dark/light mode friendly if requested.

### INTERACTIVITY & MOCK DATA (CRITICAL):
1. No Static Mockups: The component must feel alive. Implement full interactivity using React state.
2. Form & Action Handling: Buttons must have hover/active states. Forms must have \`onChange\` and \`onSubmit\` handlers that update the UI dynamically (e.g., adding an item to a list, toggling a checkbox, filtering data).
3. Hardcoded Mock Data: If the component requires data (like a dashboard table, a product list, or chat messages), generate a robust array of realistic mock data inside the file so the UI is fully populated upon rendering.
4. UI States: Include logical UI states where applicable (e.g., loading spinners that resolve, empty states if items are deleted, or tabs that switch active views).

### USER PROMPT:
`;

export type ModelProvider = "google" | "openai" | "anthropic";

export interface AIModel {
    id: string;
    name: string;
    provider: ModelProvider;
}

export const AVAILABLE_MODELS: AIModel[] = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
    { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", provider: "anthropic" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic" },
];

async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 2000
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const message = error?.message?.toLowerCase() || "";
        const status = error?.status || error?.response?.status;

        // Check for 503, 429 (Rate Limit), or specific "high demand" messages
        const isRetryable = status === 503 ||
            status === 429 ||
            message.includes("503") ||
            message.includes("high demand") ||
            message.includes("too many requests") ||
            message.includes("service unavailable");

        if (isRetryable && retries > 0) {
            console.warn(`AI API Service Busy/Unavailable. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 1.5);
        }
        throw error;
    }
}

export async function generateComponent(
    provider: ModelProvider,
    modelId: string,
    apiKey: string,
    prompt: string
): Promise<string> {
    const fullPrompt = SYSTEM_INSTRUCTION + prompt;

    return withRetry(async () => {
        let text = "";

        if (provider === "google") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            text = response.text();
        }
        else if (provider === "openai") {
            const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
            const response = await openai.chat.completions.create({
                model: modelId,
                messages: [{ role: "user", content: fullPrompt }],
            });
            text = response.choices[0]?.message?.content || "";
        }
        else if (provider === "anthropic") {
            const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
            const response = await anthropic.messages.create({
                model: modelId,
                max_tokens: 4096,
                messages: [{ role: "user", content: fullPrompt }],
            });
            text = response.content[0].type === 'text' ? response.content[0].text : "";
        }

        // Clean up any potential markdown code block artifacts
        if (text.trim().startsWith("```")) {
            text = text.replace(/^```[a-z]*\n/, "");
            text = text.replace(/\n```$/, "");
        }

        return text.trim();
    });
}
