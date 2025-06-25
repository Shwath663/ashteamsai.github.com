import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { format } from "date-fns";

interface MessageListProps {
  chatId: number;
  sessionId: string | null;
}

export function MessageList({ chatId, sessionId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chats", chatId, "messages"],
    queryFn: async () => {
      const url = sessionId 
        ? `/api/chats/${chatId}/messages?sessionId=${sessionId}`
        : `/api/chats/${chatId}/messages`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!chatId,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-github-muted">Loading messages...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-github-blue rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-github-text mb-2">
              Start the conversation
            </h3>
            <p className="text-github-muted">
              Ask me anything about coding, reasoning, or problem-solving!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-50 slide-in-from-bottom-5 duration-300`}
            >
              <div className="max-w-3xl">
                {message.role === "user" ? (
                  <div>
                    <div className="bg-github-blue text-white rounded-lg px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="text-xs text-github-muted mt-1 text-right">
                      {format(new Date(message.createdAt), "h:mm a")}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-github-surface rounded-lg flex items-center justify-center mr-3 mt-1 border border-github-border">
                      <Bot className="w-4 h-4 text-github-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-github-surface border border-github-border rounded-lg px-4 py-3">
                        <div className="prose prose-invert max-w-none">
                          <p className="whitespace-pre-wrap text-github-text">{message.content}</p>
                        </div>
                      </div>
                      <div className="text-xs text-github-muted mt-1 flex items-center">
                        <span>{format(new Date(message.createdAt), "h:mm a")}</span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <Bot className="w-3 h-3 mr-1" />
                          Phi 4 Reasoning
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
