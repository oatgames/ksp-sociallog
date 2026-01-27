import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateHashtags = async (description: string, imageBase64?: string | null): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key not found");
    return "#ErrorNoApiKey";
  }

  try {
    const parts: any[] = [];
    
    // Add image if available
    if (imageBase64) {
      // Remove data url prefix if present (e.g., "data:image/png;base64,")
      const base64Data = imageBase64.split(',')[1]; 
      const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    // Add prompt
    parts.push({
      text: `Analyze the following social media post content (and image if provided). 
      Generate 10 relevant, high-traffic SEO hashtags in Thai and English mixed. 
      Output ONLY the hashtags separated by spaces.
      
      Post Description: ${description}`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};