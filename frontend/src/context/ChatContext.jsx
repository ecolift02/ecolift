import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket, getSocket } from "../services/socketClient";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conversation) => sum + Number(conversation.unreadCount || 0), 0),
    [conversations],
  );

  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/chat/conversations");
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load conversations", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }
    fetchConversations();

    const socket = connectSocket(() => {
      socket.subscribe("/user/queue/messages", (message) => {
        const payload = JSON.parse(message.body);
        setConversations((prev) => {
          const existing = prev.find((item) => item.bookingId === payload.bookingId);
          if (existing) {
            return prev.map((item) =>
              item.bookingId === payload.bookingId
                ? { ...item, lastMessage: payload.content, lastMessageAt: payload.sentAt, unreadCount: item.unreadCount + (payload.senderId !== user?.id ? 1 : 0) }
                : item,
            );
          }
          return prev;
        });
      });
      socket.subscribe("/user/queue/inbox-update", () => {
        fetchConversations();
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user?.id]);

  const sendMessage = async (bookingId, content) => {
    if (!content?.trim()) return null;
    const response = await api.post(`/chat/${bookingId}/messages`, { content });
    return response.data;
  };

  const value = useMemo(
    () => ({
      conversations,
      totalUnread,
      activeBookingId,
      setActiveBookingId,
      fetchConversations,
      sendMessage,
    }),
    [conversations, totalUnread, activeBookingId, fetchConversations, sendMessage],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
