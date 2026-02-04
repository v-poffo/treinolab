
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutCycle, CardioSession } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateWorkoutCycle = async (height: string, weight: string, targetWeight: string, freq: number, userWishes: string): Promise<WorkoutCycle> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Chave API_KEY não configurada no ambiente.");
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Perfil: Altura ${height}, Peso ${weight}kg, Alvo ${targetWeight}kg, Frequência ${freq}x/semana. Pedido extra: "${userWishes}".`,
      config: {
        systemInstruction: `Você é um Personal Trainer de elite. Gere um ciclo de musculação para ${freq} dias. Retorne APENAS um JSON seguindo o esquema definido. Use termos técnicos em português.`,
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
                      },
                      required: ["name", "sets", "reps", "howTo"]
                    }
                  }
                },
                required: ["category", "title", "exercises"]
              }
            }
          },
          required: ["days"]
        }
      }
    });
    
    const parsed = JSON.parse(response.text || '{"days":[]}');
    return { ...parsed, generatedAt: new Date().toISOString(), totalCheckInsAtGeneration: 0 };
  } catch (error: any) {
    console.error("Erro Gemini:", error);
    throw new Error(error.message || "Falha na comunicação com Gemini");
  }
};

export const generateCardioLab = async (type: string): Promise<CardioSession> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY ausente.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Gere um protocolo de HIIT para ${type}.`,
    config: {
      systemInstruction: `Especialista em fisiologia do exercício. Gere um treino de cardio intenso. Retorne JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          duration: { type: Type.STRING },
          intensity: { type: Type.STRING },
          instructions: { type: Type.STRING },
          didacticExplanation: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                work: { type: Type.NUMBER },
                rest: { type: Type.NUMBER },
                howTo: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  return { ...data, type: type as any };
};

export const analyzeMeal = async (content: string): Promise<any> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY ausente.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analise nutricionalmente: "${content}"`,
    config: {
      systemInstruction: `Nutricionista esportivo. Estime calorias e macros. Retorne JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
