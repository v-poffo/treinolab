
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutCycle, CardioSession } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateWorkoutCycle = async (height: string, weight: string, targetWeight: string, freq: number, userWishes: string): Promise<WorkoutCycle> => {
  // Obtém a chave diretamente do ambiente
  const apiKey = process.env.API_KEY;
  
  // Inicializa o AI apenas no momento do uso para pegar a chave mais recente
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Atleta: ${height}m, ${weight}kg. Objetivo: ${targetWeight}kg. Frequência: ${freq}x. Detalhes: ${userWishes}`,
      config: {
        systemInstruction: "Você é um Personal Trainer. Gere um plano de musculação técnico. Retorne apenas JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        howTo: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("A IA não retornou resposta.");
    
    const parsed = JSON.parse(text);
    return { ...parsed, generatedAt: new Date().toISOString(), totalCheckInsAtGeneration: 0 };
  } catch (error: any) {
    console.error("Erro detalhado do Gemini:", error);
    throw error;
  }
};

export const generateCardioLab = async (type: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Gere um treino de HIIT para ${type}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeMeal = async (content: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analise: ${content}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};
