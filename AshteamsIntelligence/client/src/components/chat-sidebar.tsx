import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { Chat, User } from "@shared/schema";
import { Bot, Plus, Menu, User as UserIcon, LogOut, Trash2, KeyRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  user: User | null;
  chats: Chat[];
  currentChatId: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: number) => void;
  isAnonymous: boolean;
  isLoading: boolean;
  onCloseSidebar: () => void;
}

export function ChatSidebar({
  user,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isAnonymous,
  isLoading,
  onCloseSidebar,
}: ChatSidebarProps) {
  const { logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    if (isAnonymous) {
      localStorage.removeItem("isAnonymous");
      localStorage.removeItem("anonymousSessionId");
      setLocation("/auth");
    } else {
      logoutMutation.mutate();
    }
  };

  const handleAuthRedirect = () => {
    setLocation("/auth");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-github-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-github-blue rounded-lg flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-github-text">Ashteams AI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 text-github-muted hover:text-github-text"
            onClick={onCloseSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-github-blue rounded-full flex items-center justify-center mr-2">
              <UserIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-github-muted truncate">
              {user?.email || "Guest User"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 text-github-muted hover:text-github-text">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-github-surface border-github-border">
              {isAnonymous && (
                <DropdownMenuItem onClick={handleAuthRedirect} className="text-github-text hover:bg-github-border">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Sign In
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-github-text hover:bg-github-border">
                <LogOut className="w-4 h-4 mr-2" />
                {isAnonymous ? "Exit Guest Mode" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Anonymous indicator */}
        {isAnonymous && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 mt-2">
            <div className="flex items-center text-yellow-400 text-xs">
              <KeyRound className="w-3 h-3 mr-2" />
              <span>Guest Mode - Chats not saved</span>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full bg-github-blue hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="p-4 text-center text-github-muted text-sm">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-github-muted text-sm">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-start justify-between p-3 rounded-md cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? "bg-github-border"
                    : "hover:bg-github-border/50"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-github-text truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-github-muted mt-1">
                    {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 p-1 text-github-muted hover:text-red-400 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
