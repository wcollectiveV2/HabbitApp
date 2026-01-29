
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getAIClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateHabitTip = async (tasks: string[]) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give a single, concise, motivating health tip (max 15 words) based on these habits: ${tasks.join(", ")}. Be encouraging and energetic.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text?.trim() || "Stay hydrated and keep moving towards your goals!";
  } catch (error) {
    console.error("AI Tip Error:", error);
    return "Consistently small steps lead to big changes over time.";
  }
};

export const getCoachResponse = async (history: { role: 'user' | 'model', text: string }[], message: string) => {
  const ai = getAIClient();
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a professional habit coach and wellness expert named Pulse. You are encouraging, empathetic, and data-driven. Keep responses brief and conversational. Your goal is to help the user stick to their habits like hydration, meditation, and exercise.",
      }
    });

    // Note: In real scenarios, you'd seed history. For simplicity, we just send the message.
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Coach Error:", error);
    return "I'm having trouble connecting right now, but remember: you've got this!";
  }
};
