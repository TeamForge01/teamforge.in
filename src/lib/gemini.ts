import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("AI functionality is currently unavailable. Please ensure GEMINI_API_KEY is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = "gemini-3-flash-preview";

export async function generateUserProfile(answers: string[]) {
  const prompt = `Analyze this user's answers from a startup onboarding chat and generate a structured profile.
  Answers:
  ${answers.join("\n")}
  
  Generate:
  - Short bio (max 2 lines)
  - Skills (array of strings)
  - Interests (array of strings)
  - Suggested role (developer, designer, marketer, founder, product manager, etc.)
  - Personality summary (1-2 lines)
  - Mindset traits (array of strings, e.g., "Risk-tolerant", "Detail-oriented", "Growth-focused")
  - Knowledge gaps (array of strings, e.g., "Weak on monetization", "Needs marketing help")
  - Badges (array of strings, e.g., "Video Editing", "Serial Founder")
  - Work style (string, e.g., "Async-preferred", "High-collaboration")
  - Recommendations (what kind of startups they should join)
  - LookingFor (a short summary of the type of co-founder they are looking for)`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bio: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          interests: { type: Type.ARRAY, items: { type: Type.STRING } },
          role: { type: Type.STRING },
          personality: { type: Type.STRING },
          mindsetTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
          knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          badges: { type: Type.ARRAY, items: { type: Type.STRING } },
          workStyle: { type: Type.STRING },
          recommendations: { type: Type.STRING },
          lookingFor: { type: Type.STRING }
        },
        required: ["bio", "skills", "interests", "role", "personality", "mindsetTraits", "knowledgeGaps", "badges", "workStyle", "recommendations", "lookingFor"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function validateIdea(idea: any) {
  const prompt = `Analyze this startup idea and provide a comprehensive validation report.
  Title: ${idea.title}
  Description: ${idea.description}
  Problem: ${idea.problem}
  Solution: ${idea.solution}
  Target Audience: ${idea.targetAudience}
  Revenue Model: ${idea.revenueModel || "Not specified"}
  Geography: ${idea.geography || "Not specified"}
  
  Return a structured JSON with:
  - score (1-100)
  - viabilityStars (1-5)
  - metrics: {
      competition: number (1-10 score),
      demand: number (1-10 score),
      monetization: number (1-10 score),
      risks: number (1-10 score),
      futurePotential: number (1-10 score)
    }
  - metricAnalysis: {
      competition: string (short analysis),
      demand: string (short analysis),
      monetization: string (short analysis),
      risks: string (short analysis),
      futurePotential: string (short analysis)
    }
  - strengths (array of strings)
  - weaknesses (array of strings)
  - suggestions (array of strings)
  - competitors (array of strings, top 5 competitors)`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          viabilityStars: { type: Type.NUMBER },
          metrics: {
            type: Type.OBJECT,
            properties: {
              competition: { type: Type.NUMBER },
              demand: { type: Type.NUMBER },
              monetization: { type: Type.NUMBER },
              risks: { type: Type.NUMBER },
              futurePotential: { type: Type.NUMBER }
            },
            required: ["competition", "demand", "monetization", "risks", "futurePotential"]
          },
          metricAnalysis: {
            type: Type.OBJECT,
            properties: {
              competition: { type: Type.STRING },
              demand: { type: Type.STRING },
              monetization: { type: Type.STRING },
              risks: { type: Type.STRING },
              futurePotential: { type: Type.STRING }
            },
            required: ["competition", "demand", "monetization", "risks", "futurePotential"]
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          competitors: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "viabilityStars", "metrics", "metricAnalysis", "strengths", "weaknesses", "suggestions", "competitors"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function rankCoFounderMatches(userProfile: any, otherProfiles: any[]) {
  const prompt = `You are a world-class startup co-founder matchmaker. Your goal is to find the absolute best partners for a founder based on deep psychological and professional compatibility.
  
  CURRENT USER:
  - Role: ${userProfile.role}
  - Bio: ${userProfile.bio}
  - Skills: ${userProfile.skills?.join(", ")}
  - Interests: ${userProfile.interests?.join(", ")}
  - Mindset: ${userProfile.mindsetTraits?.join(", ")}
  - Knowledge Gaps: ${userProfile.knowledgeGaps?.join(", ")}
  - Looking For: ${userProfile.lookingFor}
  
  POTENTIAL MATCHES:
  ${otherProfiles.map((p, i) => `
  MATCH #${i}:
  - Name: ${p.displayName}
  - Role: ${p.role}
  - Bio: ${p.bio}
  - Skills: ${p.skills?.join(", ")}
  - Interests: ${p.interests?.join(", ")}
  - Mindset: ${p.mindsetTraits?.join(", ")}
  - Looking For: ${p.lookingFor}
  `).join("\n")}
  
  MATCHING CRITERA:
  1. Complementary Skills: Does the match fill the user's knowledge gaps? (e.g., Tech founder + Marketing expert)
  2. Shared Vision: Do their interests and "Looking For" descriptions align?
  3. Personality Synergy: Based on their bios and mindset traits, would they work well together?
  4. Role Balance: Avoid matching two people who want the exact same lead role unless they have distinct domains.
  
  Return a structured JSON with an array of "matches". Each match should include:
  - index (the number from the list above)
  - score (1-100)
  - reason (a deep, insightful 1-2 sentence explanation of why this specific pairing is powerful)
  
  Return only the top 4 matches, sorted by score descending.`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.NUMBER },
                score: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ["index", "score", "reason"]
            }
          }
        },
        required: ["matches"]
      }
    }
  });

  const data = JSON.parse(response.text || '{"matches":[]}');
  
  return data.matches.map((m: any) => ({
    ...otherProfiles[m.index],
    matchScore: m.score,
    matchReason: m.reason
  }));
}

export async function chatWithLearningAssistant(messages: any[], userContext: any) {
  const systemInstruction = `You are a helpful Learning Assistant for a startup platform. 
  User Context:
  - Role: ${userContext.role}
  - Skills: ${userContext.skills?.join(", ")}
  - Knowledge Gaps: ${userContext.knowledgeGaps?.join(", ")}
  - Current Idea Validation: ${userContext.lastValidationScore || "N/A"}
  ${userContext.currentCourse ? `- Currently Watching: ${userContext.currentCourse.title} by ${userContext.currentCourse.instructor} (${userContext.currentCourse.category})` : ""}
  
  Help the user with their questions about startups, skills, or their current projects.
  If they are watching a course, provide specific insights or answer questions related to that topic.
  Keep responses concise, encouraging, and practical.`;

  const ai = getAi();
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction
    }
  });

  return response.text;
}

export async function validateIdeaDetailed(
  description: string,
  targetAudience: string,
  revenueModel: string,
  geography: string
) {
  const prompt = `Objective: Perform a comprehensive research query to gather data on competition, market demand, monetization potential, associated risks, and future outlook for the following business idea. 
  
  Idea Description: ${description}
  Target Audience: ${targetAudience}
  Revenue Model: ${revenueModel}
  Geography: ${geography}

  Analyze the idea and provide a detailed report following this structure:
  - Overall Score: (integer 1-10)
  - Competition Analysis: Metric findings (Score 1-10), specific competitors, and how the idea differentiates.
  - Market Demand: Analysis of user interest, keyword volume proxies, or social media trends (Score 1-10).
  - Monetization Potential: Viability of the revenue model, pricing benchmarks, and scalability (Score 1-10).
  - Risks and Challenges: Technical feasibility, regulatory issues, and market risks (Score 1-10).
  - Future Outlook: Industry growth projections and expansion possibilities (Score 1-10).

  Also include:
  - Top 5 direct/indirect competitors with their names, descriptions, and valid website links.
  - Actionable recommendations to improve scores.
  - Concrete next steps for the founder (e.g., "Validate with 50 user interviews", "Build landing page").`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Overall viability score out of 10" },
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
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "competition", "demand", "monetization", "risks", "future", "strengths", "weaknesses", "recommendations", "competitors", "nextSteps"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
