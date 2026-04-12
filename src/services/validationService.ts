import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ValidationResult {
  score: number;
  competition: {
    score: number;
    analysis: string;
  };
  demand: {
    score: number;
    analysis: string;
  };
  monetization: {
    score: number;
    analysis: string;
  };
  risks: {
    score: number;
    analysis: string;
  };
  future: {
    score: number;
    analysis: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  competitors: { name: string; link: string; description: string }[];
  nextSteps: string[];
}

export async function validateIdea(
  description: string,
  targetAudience: string,
  revenueModel: string,
  geography: string
): Promise<ValidationResult> {
  const prompt = `Validate this startup idea:
Idea Description: ${description}
Target Audience: ${targetAudience}
Revenue Model: ${revenueModel}
Geography: ${geography}

Provide a detailed breakdown including scores (1-10) for Competition, Demand, Monetization, Risks, and Future.
Also provide strengths, weaknesses, recommendations, a list of 5 direct/indirect competitors with descriptions and placeholder links, and next steps.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          competition: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          demand: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          monetization: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          risks: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          future: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                link: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "link", "description"]
            }
          },
          nextSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: [
          "score", 
          "competition", 
          "demand", 
          "monetization", 
          "risks", 
          "future", 
          "strengths", 
          "weaknesses", 
          "recommendations", 
          "competitors", 
          "nextSteps"
        ]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
