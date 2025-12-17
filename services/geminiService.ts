import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is securely handled.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface AnalysisResult {
  match: boolean;
  count: number;
  reason: string;
  discrepancy: boolean;
}

export const analyzeImage = async (
  base64Image: string, 
  itemDescription: string, 
  requiredQty: number
): Promise<AnalysisResult> => {
  
  if (!process.env.API_KEY) {
    console.warn("API Key missing, returning mock success for demo.");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      match: true,
      count: requiredQty,
      reason: "Simulação: Item identificado corretamente.",
      discrepancy: false
    };
  }

  try {
    const modelId = "gemini-2.5-flash"; // Fast model for image analysis
    
    const prompt = `
      Analyze this image. The expected item is "${itemDescription}" and the required quantity is ${requiredQty}.
      Count the visible items that match the description.
      Return a JSON object with:
      - count: number of items found
      - reason: short explanation
      - match: boolean (true if count >= required quantity)
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            count: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            match: { type: Type.BOOLEAN },
          },
          required: ["count", "reason", "match"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      match: result.match,
      count: result.count,
      reason: result.reason,
      discrepancy: result.count < requiredQty
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      match: false,
      count: 0,
      reason: "Erro ao analisar imagem. Tente novamente.",
      discrepancy: true
    };
  }
};
