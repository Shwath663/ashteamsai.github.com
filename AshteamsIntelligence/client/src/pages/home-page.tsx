import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatArea } from "@/components/chat-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Chat } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAnonymous = !user && typeof window !== "undefined" && localStorage.getItem("isAnonymous") === "true";

  // Initialize session for anonymous users
  useEffect(() => {
    if (isAnonymous && !sessionId) {
      const storedSessionId = localStorage.getItem("anonymousSessionId");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    }
  }, [isAnonymous, sessionId]);

  // Fetch chats
  const { data: chats = [], isLoading: chatsLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats", sessionId],
    queryFn: async () => {
      const url = sessionId ? `/api/chats?sessionId=${sessionId}` : "/api/chats";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
    enabled: !!user || !!sessionId,
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const data = sessionId ? { title, sessionId } : { title };
      const res = await apiRequest("POST", "/api/chats", data);
      return res.json();
    },
    onSuccess: (newChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setCurrentChatId(newChat.id);
      toast({
        title: "New chat created",
        description: "Ready to start your conversation!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: number) => {
      const url = sessionId ? `/api/chats/${chatId}?sessionId=${sessionId}` : `/api/chats/${chatId}`;
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setCurrentChatId(null);
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    const title = `Chat ${(chats?.length || 0) + 1}`;
    createChatMutation.mutate(title);
  };

  const handleDeleteChat = (chatId: number) => {
    deleteChatMutation.mutate(chatId);
  };

  const currentChat = chats?.find(chat => chat.id === currentChatId);

  return (
    <div className="h-screen flex bg-github-dark text-github-text">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 
        bg-github-surface border-r border-github-border transition-transform duration-300 ease-in-out
      `}>
        <ChatSidebar
          user={user}
          chats={chats || []}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isAnonymous={isAnonymous}
          isLoading={chatsLoading}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          currentChat={currentChat}
          sessionId={sessionId}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
}
