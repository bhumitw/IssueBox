import { GoogleGenAI } from "@google/genai";
import { Issue, Appreciation, User } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const SOFTEN_INSTRUCTION = `
You are a compassionate and skilled relationship therapist with deep experience in Non-Violent Communication (NVC).  
Your role is to gently transform emotionally raw or reactive partner messages into versions that are clearer, kinder, and easier for the other person to hear.

When you rewrite:
1. Tune into the underlying feelings and unmet needs in the original message.
2. Express them using simple, honest “I” statements (e.g., “I feel X when Y because I need Z”).
3. Remove any attacks, blame, exaggerations, or harsh language.
4. Keep the message focused, sincere, and grounded in the core issue.
5. Preserve the original meaning and concern—just express it in a way that supports connection and understanding.
6. Respond **only** with the softened message. No explanations or extra commentary.

`;

const MEDIATOR_INSTRUCTION = `
You are "The Mediator", an objective, compassionate, and strictly neutral AI relationship counselor. 
Your goal is to help the couple understand each other's perspectives based on their communication history.

CORE GUARDRAILS (STRICT ENFORCEMENT):
1. NEVER take sides. Even if one partner seems objectively "wrong," focus on the communication breakdown or underlying needs.
2. DO NOT validate abuse, insults, or manipulation. If a user asks you to validate an attack, gently redirect to healthy communication.
3. DO NOT give breakup advice. Your goal is mediation and understanding.
4. If a user asks "Who is right?", explain that relationships are about perspective, not winning.
5. Use the provided "Relationship Context" to inform your answers. If you see a pattern in the history (e.g., repeated issues about chores), mention it gently.

Output Style:
- Warm, empathetic, but professional.
- Short to medium length paragraphs.
- Use NVC principles.
`;

export const softenMessage = async (rawText: string): Promise<string> => {
  if (!apiKey) return "AI processing unavailable (Missing API Key). " + rawText;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: rawText,
      config: {
        systemInstruction: SOFTEN_INSTRUCTION,
        temperature: 0.7,
      }
    });
    return response.text || rawText;
  } catch (error) {
    console.error("Error softening message:", error);
    return rawText;
  }
};

export const getMediatorResponse = async (
  currentMessage: string,
  history: { role: 'user' | 'model'; text: string }[],
  context: { issues: Issue[]; appreciations: Appreciation[]; currentUser: User; partner: User }
): Promise<string> => {
  if (!apiKey) return "I cannot connect to my brain right now (Missing API Key).";

  // Prepare context summary (anonymized to logic)
  const recentIssues = context.issues
    .slice(-10)
    .map(i => `[${new Date(i.timestamp).toLocaleDateString()}] ${i.authorId === context.currentUser.id ? 'User' : 'Partner'} (${i.isPrivate ? 'Private Draft' : 'Shared'}): ${i.contentRaw}`)
    .join('\n');

  const recentAppreciations = context.appreciations
    .slice(-5)
    .map(a => `[${new Date(a.timestamp).toLocaleDateString()}] ${a.authorId === context.currentUser.id ? 'User' : 'Partner'}: ${a.content}`)
    .join('\n');

  const contextPrompt = `
    RELATIONSHIP CONTEXT (Last 6 months summary):
    - Current User: ${context.currentUser.name}
    - Partner: ${context.partner.name}
    
    RECENT COMMUNICATION LOG:
    ${recentIssues}
    
    RECENT APPRECIATIONS:
    ${recentAppreciations}
    
    USER'S QUESTION:
    ${currentMessage}
  `;

  try {
    // Format history for the chat model
    // Note: Gemini API treats 'user' and 'model' roles.
    // We append the context to the very last user message for RAG-like behavior
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: contextPrompt }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: MEDIATOR_INSTRUCTION,
        temperature: 0.6, // Lower temperature for more consistent/safe advice
      }
    });

    return response.text || "I'm having trouble understanding the situation. Could you rephrase?";
  } catch (error) {
    console.error("Mediator error:", error);
    return "I'm having trouble connecting right now.";
  }
};