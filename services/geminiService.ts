
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutCycle, CardioSession } from "../types";

// Usando gemini-3-flash-preview para evitar erros de quota e garantir estabilidade.
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateWorkoutCycle = async (height: string, weight: string, targetWeight: string, freq: number, userWishes: string): Promise<WorkoutCycle> => {
  if (!process.env.API_KEY) {
    throw new Error("A chave API_KEY não foi encontrada no ambiente.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Dados: Altura ${height}, Peso ${weight}kg, Alvo ${targetWeight}kg, Freq ${freq}x/sem. Pedido: "${userWishes}".`,
    config: {
      systemInstruction: `Atue como Master Personal IA. Gere exatamente ${freq} treinos (A, B, C...). Inclua séries, repetições, howTo didático e propósito técnico. Retorne estritamente JSON.`,
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
                      muscleGroup: { type: Type.STRING },
                      description: { type: Type.STRING },
                      howTo: { type: Type.STRING },
                      purpose: { type: Type.STRING }
                    },
                    required: ["name", "sets", "reps", "description", "howTo", "purpose"]
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
};

export const generateCardioLab = async (type: 'Bike' | 'Corrida' | 'Funcional' | 'Abs'): Promise<CardioSession> => {
  if (!process.env.API_KEY) {
    throw new Error("A chave API_KEY não foi encontrada no ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Gere protocolo de ${type} HIIT.`,
    config: {
      systemInstruction: `Especialista em HIIT Didático. Gere uma sessão completa com duração, intensidade e intervalos/exercícios. Retorne JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          duration: { type: Type.STRING },
          intensity: { type: Type.STRING },
          instructions: { type: Type.STRING },
          didacticExplanation: { type: Type.STRING },
          intervals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { 
                label: { type: Type.STRING }, 
                seconds: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["label", "seconds"]
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { 
                name: { type: Type.STRING }, 
                work: { type: Type.NUMBER }, 
                rest: { type: Type.NUMBER }, 
                instructions: { type: Type.STRING },
                howTo: { type: Type.STRING }
              },
              required: ["name", "work", "rest", "instructions", "howTo"]
            }
          }
        },
        required: ["duration", "intensity", "instructions", "didacticExplanation"]
      }
    }
  });
  
  const data = JSON.parse(response.text || '{}');
  return { ...data, type };
};

export const analyzeMeal = async (content: string): Promise<any> => {
  if (!process.env.API_KEY) {
    throw new Error("A chave API_KEY não foi encontrada no ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analise: "${content}".`,
    config: { 
      systemInstruction: `Nutricionista Master. Estime calorias e macros reais. Seja preciso e didático no JSON.`,
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
        },
        required: ["analysis", "calories"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
