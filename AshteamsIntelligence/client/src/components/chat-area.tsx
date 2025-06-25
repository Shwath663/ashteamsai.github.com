import { Button } from "@/components/ui/button";
import { Chat } from "@shared/schema";
import { Menu, Settings, Fan, Bot } from "lucide-react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

interface ChatAreaProps {
  currentChat: Chat | undefined;
  sessionId: string | null;
  onToggleSidebar: () => void;
}

export function ChatArea({ currentChat, sessionId, onToggleSidebar }: ChatAreaProps) {
  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-github-surface border-b border-github-border p-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-3 p-2 text-github-muted hover:text-github-text"
            onClick={onToggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-github-text">Ashteams AI</h2>
            <p className="text-xs text-github-muted">Select a chat or create a new one</p>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-github-blue rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-github-text mb-2">
              Welcome to Ashteams AI
            </h3>
            <p className="text-github-muted">
              Your intelligent AI assistant is ready to help. Create a new chat to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-github-surface border-b border-github-border p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-3 p-2 text-github-muted hover:text-github-text"
            onClick={onToggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-github-text">{currentChat.title}</h2>
            <p className="text-xs text-github-muted">
              Ashteams AI Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-github-muted hover:text-github-text"
            title="Clear Chat"
          >
            <Fan className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-github-muted hover:text-github-text"
            title="Chat Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <MessageList chatId={currentChat.id} sessionId={sessionId} />

      {/* Input */}
      <MessageInput chatId={currentChat.id} sessionId={sessionId} />
    </div>
  );
}
