import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { 
  serverGenerateUserProfile, 
  serverValidateIdea, 
  serverRankCoFounderMatches, 
  serverChatWithLearningAssistant,
  serverValidateIdeaDetailed
} from "./src/services/gemini.server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    console.log("Starting TeamForge Server...");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Request logger
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });

    // API Routes
    app.get("/api/health", (req, res) => {
      console.log("Health check hit");
      res.json({ status: "ok" });
    });

    app.get("/api/test", (req, res) => {
      res.json({ message: "API is working" });
    });

    app.post("/api/ai/generate-profile", async (req, res) => {
      console.log("Generate profile hit:", req.body);
      try {
        const { answers } = req.body;
        const profile = await serverGenerateUserProfile(answers);
        res.json(profile);
      } catch (error: any) {
        console.error("Server AI Error (generate-profile):", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/ai/validate-idea", async (req, res) => {
      try {
        const { idea } = req.body;
        const validation = await serverValidateIdea(idea);
        res.json(validation);
      } catch (error: any) {
        console.error("Server AI Error (validate-idea):", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/ai/validate-idea-detailed", async (req, res) => {
      try {
        const { description, targetAudience, revenueModel, geography } = req.body;
        const validation = await serverValidateIdeaDetailed(description, targetAudience, revenueModel, geography);
        res.json(validation);
      } catch (error: any) {
        console.error("Server AI Error (validate-idea-detailed):", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/ai/rank-matches", async (req, res) => {
      try {
        const { userProfile, otherProfiles } = req.body;
        const matches = await serverRankCoFounderMatches(userProfile, otherProfiles);
        res.json(matches);
      } catch (error: any) {
        console.error("Server AI Error (rank-matches):", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/ai/chat", async (req, res) => {
      try {
        const { messages, userContext } = req.body;
        const response = await serverChatWithLearningAssistant(messages, userContext);
        res.json({ text: response });
      } catch (error: any) {
        console.error("Server AI Error (chat):", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Catch-all for unhandled API routes
    app.all("/api/*", (req, res) => {
      console.log("Unhandled API request:", req.method, req.url);
      res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("CRITICAL SERVER STARTUP ERROR:", err);
    process.exit(1);
  }
}

startServer();
