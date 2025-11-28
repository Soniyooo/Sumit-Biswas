import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client. 
// Note: In a production app, you would likely proxy this through a backend 
// to avoid exposing the key or use a secure token exchange.
// For this demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey });

export const enhancePostContent = async (text: string): Promise<string> => {
  if (!apiKey) return text;

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Rewrite the following social media post to be more engaging, witty, and polished, but keep the original meaning. Return ONLY the rewritten text, no explanations. 
    
    Original text: "${text}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};

export const generateImageCaption = async (base64Image: string, mimeType: string): Promise<string> => {
  if (!apiKey) return "";

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Generate a short, creative, and engaging caption for this image suitable for a social media post. Do not include hashtags."
          }
        ]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};

export const generateSecurityEmail = async (userName: string, code: string): Promise<string> => {
  if (!apiKey) return `Subject: Password Reset Code\n\nHello ${userName},\n\nYour verification code is: ${code}`;

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, professional, and friendly email body for a password reset request. 
    The user's name is "${userName}".
    The security code is "${code}".
    Make it sound like it's coming from "Sphere AI Security Team".
    Return ONLY the email body text.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || `Your Sphere verification code is ${code}`;
  } catch (error) {
    return `Your Sphere verification code is ${code}`;
  }
};