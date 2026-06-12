import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with a higher limit for images
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client lazily or with a check
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_IF_MISSING",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. CHATBOT: /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "Google Gemini API key is missing. Please add it in your Secrets/Settings.",
      });
      return;
    }

    const ai = getGeminiClient();
    
    // Set up chat with history
    const systemInstruction = 
      "You are LUXECARE's expert AI Dermatologist Assistant, specializing in Korean skincare (K-Beauty) imported to India. " +
      "Provide professional, empathetic, and detailed guidance. Always recommend Korean ingredients " +
      "(like Centella Asiatica, Snail Mucin, Rice water, Probiotics, Ginseng, Propolis, Heartleaf, Mugwort) " +
      "as solutions. Answer skincare, scalp, and hair health related queries. " +
      "Be concise but highly professional, and format with bullet points and bold headers if suitable. " +
      "Maintain a luxury, friendly spa assistant persona. Never diagnose serious clinical diseases; instruct to consult a physical doctor if it seems highly medical.";

    // Convert history format if present
    const chatHistory = history ? history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    })) : [];

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: chatHistory,
      config: {
        systemInstruction,
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini Chat." });
  }
});

// 2. SKIN & HAIR ANALYSIS: /api/analyze-skin-hair
app.post("/api/analyze-skin-hair", async (req, res) => {
  try {
    const { image, description, skinTypeAnswer, hairTypeAnswer } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "Google Gemini API key is missing. Please add it in your Secrets/Settings.",
      });
      return;
    }

    const ai = getGeminiClient();
    
    // Build parts for multimodality
    const parts: any[] = [];
    
    if (image) {
      // Expect format: "data:image/jpeg;base64,..."
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const promptText = `
Analyze the skin and hair based on the provided data.
User input:
- Dry/Redness/Oiliness notes: ${description || "None provided"}
- Predefined Skin Type user claims: ${skinTypeAnswer || "Unknown"}
- Predefined Hair Type user claims: ${hairTypeAnswer || "Unknown"}

Perform a luxury K-Beauty diagnostic. Output a structured JSON.
Ensure you recommend genuine Korean star active ingredients (Centella, Snail Mucin, heartleaf, etc.) and suggest exact treatment routines suited for importing to India.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinType: { type: Type.STRING, description: "Identified K-Beauty skin type (Dry, Oily, Sensitive, Combination, Normal)" },
            skinScore: { type: Type.INTEGER, description: "Overall skin health index (1 to 100)" },
            hairScore: { type: Type.INTEGER, description: "Overall scalp/hair health index (1 to 100)" },
            concerns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Identified problems, e.g. Hyperpigmentation, Dryness, Sebum, Dandruff, Frizz"
            },
            ingredientMatch: { type: Type.STRING, description: "Highlighted key Korean active ingredients matching this diagnosis" },
            explanation: { type: Type.STRING, description: "Detailed, premium, spa-like feedback about their concerns" },
            morningRoutine: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggested morning steps in K-Beauty style"
            },
            nightRoutine: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggested evening steps in K-Beauty style"
            },
            treatments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 targeted treatments specifically for this condition"
            }
          },
          required: ["skinType", "skinScore", "hairScore", "concerns", "ingredientMatch", "explanation", "morningRoutine", "nightRoutine", "treatments"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Skin Analysis." });
  }
});

// 3. SECURE ROUTINE GENERATOR: /api/generate-routine
app.post("/api/generate-routine", async (req, res) => {
  try {
    const { skinType, budget, primaryConcern, climate } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "Google Gemini API key is missing. Please add it in your Secrets/Settings.",
      });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `
Generate a highly detailed, personalized KoreanSkincare routine for a user in India.
Details:
- Skin Type: ${skinType}
- Target concern: ${primaryConcern}
- Budget range: ${budget}
- Local Climate / Weather in India: ${climate}

Return a structured JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Routine title" },
            description: { type: Type.STRING, description: "Overview explanation" },
            morningSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNum: { type: Type.INTEGER },
                  stepName: { type: Type.STRING, description: "e.g., Double Cleanse, Essence" },
                  productType: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  activeIngredient: { type: Type.STRING }
                },
                required: ["stepNum", "stepName", "productType", "benefit", "activeIngredient"]
              }
            },
            eveningSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNum: { type: Type.INTEGER },
                  stepName: { type: Type.STRING },
                  productType: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  activeIngredient: { type: Type.STRING }
                },
                required: ["stepNum", "stepName", "productType", "benefit", "activeIngredient"]
              }
            },
            keyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Direct recommendations of imported K-Beauty types"
            }
          },
          required: ["title", "description", "morningSteps", "eveningSteps", "keyRecommendations"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Routine generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Routine Generator." });
  }
});

// Wrap final middleware & listen configuration in async function
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LUXECARE] Server successfully running at http://localhost:${PORT} under ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start LUXECARE full-stack workspace server:", err);
});
