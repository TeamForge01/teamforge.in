import { validateIdeaDetailed } from '../lib/gemini';

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
  return validateIdeaDetailed(description, targetAudience, revenueModel, geography);
}
