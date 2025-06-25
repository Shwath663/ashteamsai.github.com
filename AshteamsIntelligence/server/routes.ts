import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openRouterService, type OpenRouterMessage } from "./services/openrouter";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Generate session ID for anonymous users
  app.post("/api/anonymous-session", (req, res) => {
    const sessionId = nanoid();
    res.json({ sessionId });
  });

  // Chat routes
  app.get("/api/chats", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      let chats;

      if (req.isAuthenticated()) {
        chats = await storage.getChatsByUserId(req.user!.id);
      } else if (sessionId) {
        chats = await storage.getChatsBySessionId(sessionId);
      } else {
        return res.status(400).json({ message: "Authentication or session ID required" });
      }

      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      const { title, sessionId } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      let chatData;
      if (req.isAuthenticated()) {
        chatData = {
          title,
          userId: req.user!.id,
          isAnonymous: false,
        };
      } else if (sessionId) {
        chatData = {
          title,
          sessionId,
          isAnonymous: true,
        };
      } else {
        return res.status(400).json({ message: "Authentication or session ID required" });
      }

      const chat = await storage.createChat(chatData);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.delete("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Check authorization
      const sessionId = req.query.sessionId as string;
      if (req.isAuthenticated()) {
        if (chat.userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (sessionId) {
        if (chat.sessionId !== sessionId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      await storage.deleteChat(chatId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  app.patch("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const { title } = req.body;
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Check authorization
      const sessionId = req.query.sessionId as string;
      if (req.isAuthenticated()) {
        if (chat.userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (sessionId) {
        if (chat.sessionId !== sessionId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (title) {
        await storage.updateChatTitle(chatId, title);
      }

      const updatedChat = await storage.getChat(chatId);
      res.json(updatedChat);
    } catch (error) {
      console.error("Error updating chat:", error);
      res.status(500).json({ message: "Failed to update chat" });
    }
  });

  // Message routes
  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Check authorization
      const sessionId = req.query.sessionId as string;
      if (req.isAuthenticated()) {
        if (chat.userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (sessionId) {
        if (chat.sessionId !== sessionId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const { content } = req.body;
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Check authorization
      const sessionId = req.query.sessionId as string;
      if (req.isAuthenticated()) {
        if (chat.userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (sessionId) {
        if (chat.sessionId !== sessionId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        chatId,
        role: "user",
        content: content.trim(),
      });

      // Get previous messages for context
      const messages = await storage.getMessagesByChatId(chatId);
      const openRouterMessages: OpenRouterMessage[] = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      try {
        // Get AI response
        const aiResponse = await openRouterService.chatCompletion(openRouterMessages);
        
        // Create AI message
        const aiMessage = await storage.createMessage({
          chatId,
          role: "assistant",
          content: aiResponse,
        });

        res.json({
          userMessage,
          aiMessage,
        });
      } catch (aiError) {
        console.error("AI response error:", aiError);
        // Create error message
        const errorMessage = await storage.createMessage({
          chatId,
          role: "assistant",
          content: "I apologize, but I'm having trouble generating a response right now. Please try again later.",
        });

        res.json({
          userMessage,
          aiMessage: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.delete("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Check authorization
      const sessionId = req.query.sessionId as string;
      if (req.isAuthenticated()) {
        if (chat.userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (sessionId) {
        if (chat.sessionId !== sessionId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      await storage.clearChatMessages(chatId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);

  // Note: WebSocket server disabled in development to avoid conflicts with Vite HMR
  // TODO: Re-enable for production streaming features if needed
  
  return httpServer;
}
