import { users, chats, messages, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChat(id: number): Promise<Chat | undefined>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  getChatsBySessionId(sessionId: string): Promise<Chat[]>;
  createChat(chat: InsertChat & { userId?: number }): Promise<Chat>;
  deleteChat(id: number): Promise<void>;
  updateChatTitle(id: number, title: string): Promise<void>;
  
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearChatMessages(chatId: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentChatId: number;
  private currentMessageId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.userId === userId
    );
  }

  async getChatsBySessionId(sessionId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.sessionId === sessionId
    );
  }

  async createChat(chatData: InsertChat & { userId?: number }): Promise<Chat> {
    const id = this.currentChatId++;
    const now = new Date();
    const chat: Chat = {
      id,
      userId: chatData.userId || null,
      title: chatData.title,
      isAnonymous: chatData.isAnonymous || false,
      sessionId: chatData.sessionId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.chats.set(id, chat);
    return chat;
  }

  async deleteChat(id: number): Promise<void> {
    this.chats.delete(id);
    // Also delete associated messages
    Array.from(this.messages.entries()).forEach(([messageId, message]) => {
      if (message.chatId === id) {
        this.messages.delete(messageId);
      }
    });
  }

  async updateChatTitle(id: number, title: string): Promise<void> {
    const chat = this.chats.get(id);
    if (chat) {
      chat.title = title;
      chat.updatedAt = new Date();
      this.chats.set(id, chat);
    }
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    // Update chat's updatedAt timestamp
    const chat = this.chats.get(insertMessage.chatId);
    if (chat) {
      chat.updatedAt = new Date();
      this.chats.set(insertMessage.chatId, chat);
    }
    
    return message;
  }

  async clearChatMessages(chatId: number): Promise<void> {
    Array.from(this.messages.entries()).forEach(([messageId, message]) => {
      if (message.chatId === chatId) {
        this.messages.delete(messageId);
      }
    });
  }
}

export const storage = new MemStorage();
