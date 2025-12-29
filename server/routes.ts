import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI with Replit AI Integrations environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Passport Authentication
  setupAuth(app);

  // --- API Routes ---

  // Documents List
  app.get(api.documents.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const docs = await storage.getDocuments(req.user.id);
    res.json(docs);
  });

  // Get Document
  app.get(api.documents.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const doc = await storage.getDocument(Number(req.params.id));
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    res.json(doc);
  });

  // Create Document (Save)
  app.post(api.documents.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const input = api.documents.create.input.parse(req.body);
      const doc = await storage.createDocument({ ...input, userId: req.user.id });
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Delete Document
  app.delete(api.documents.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const doc = await storage.getDocument(Number(req.params.id));
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    
    await storage.deleteDocument(Number(req.params.id));
    res.status(204).send();
  });

  // Generate Document with AI
  app.post(api.generate.document.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const { type, language, department, issue } = api.generate.document.input.parse(req.body);

      const prompt = `You are a legal drafting assistant for Pakistan. Draft a ${type} in ${language}. 
      Address it to ${department || "the concerned authority"}. 
      User issue: ${issue}. 
      Use formal Pakistani legal language and official formatting. 
      Include placeholders like [NAME], [CNIC], [ADDRESS], [DATE] where appropriate.
      Do not include any conversational text, just the document content.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1", // or gpt-4o as per available models
        messages: [
          { role: "system", content: "You are a professional legal assistant for Pakistan." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content || "Failed to generate document.";
      res.json({ content });

    } catch (err) {
      console.error("Generation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  return httpServer;
}
