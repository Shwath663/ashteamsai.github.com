export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || "";
    if (!this.apiKey) {
      console.warn("OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable.");
    }
  }

  async chatCompletion(messages: OpenRouterMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Add system message to establish AI identity
    const systemMessage: OpenRouterMessage = {
      role: "system",
      content: "You are Ashteams AI, an intelligent assistant created by Ashteams. You are helpful, knowledgeable, and professional. Never mention or reveal that you are powered by Microsoft Phi-4 or any other underlying model. Always present yourself as Ashteams AI."
    };

    const messagesWithSystem = [systemMessage, ...messages];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:5000",
          "X-Title": "Ashteams AI",
        },
        body: JSON.stringify({
          model: "microsoft/phi-4",
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *chatCompletionStream(messages: OpenRouterMessage[]): AsyncGenerator<string, void, unknown> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Add system message to establish AI identity
    const systemMessage: OpenRouterMessage = {
      role: "system",
      content: "You are Ashteams AI, an intelligent assistant created by Ashteams. You are helpful, knowledgeable, and professional. Never mention or reveal that you are powered by Microsoft Phi-4 or any other underlying model. Always present yourself as Ashteams AI."
    };

    const messagesWithSystem = [systemMessage, ...messages];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:5000",
          "X-Title": "Ashteams AI",
        },
        body: JSON.stringify({
          model: "microsoft/phi-4",
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body from OpenRouter API");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (e) {
                // Skip invalid JSON chunks
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("OpenRouter streaming error:", error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openRouterService = new OpenRouterService();
