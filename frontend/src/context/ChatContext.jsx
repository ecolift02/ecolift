import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket, getSocket } from "../services/socketClient";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [pendingIncomingCallAcceptBookingId, setPendingIncomingCallAcceptBookingId] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});
  const activeBookingIdRef = useRef(activeBookingId);

  const totalUnread = useMemo(
    () => Object.values(unreadMap).reduce((sum, count) => sum + Number(count || 0), 0),
    [unreadMap],
  );

  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/chat/conversations");
      const data = Array.isArray(response.data) ? response.data : [];
      setConversations(data);
      const map = data.reduce((acc, item) => {
        if (item?.bookingId != null) {
          acc[item.bookingId] = Number(item.unreadCount || 0);
        }
        return acc;
      }, {});
      setUnreadMap(map);
    } catch (error) {
      console.error("Failed to load conversations", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setUnreadMap({});
      setIncomingCall(null);
      setPendingIncomingCallAcceptBookingId(null);
      return;
    }
    fetchConversations();

    activeBookingIdRef.current = activeBookingId;

    const socketInstance = connectSocket(() => {
      socketInstance.subscribe("/user/queue/messages", (message) => {
        const payload = JSON.parse(message.body);
        const currentUserId = String(user?.id ?? user?._id ?? user?.userId ?? user?.user?._id ?? "");
        const senderId = String(payload.senderId ?? payload.sender?._id ?? payload.sender?.id ?? payload.from ?? "");

        setConversations((prev) => {
          const existing = prev.find((item) => item.bookingId === payload.bookingId);
          if (existing) {
            return prev.map((item) =>
              item.bookingId === payload.bookingId
                ? {
                    ...item,
                    lastMessage: payload.content,
                    lastMessageAt: payload.sentAt,
                    unreadCount: senderId !== currentUserId && item.bookingId !== activeBookingIdRef.current
                      ? item.unreadCount + 1
                      : item.unreadCount,
                  }
                : item,
            );
          }
          return prev;
        });

        setUnreadMap((prev) => {
          if (!payload.bookingId || senderId === currentUserId) return prev;
          const existingCount = Number(prev[payload.bookingId] ?? 0);
          if (String(payload.bookingId) === String(activeBookingIdRef.current)) {
            return prev;
          }
          return {
            ...prev,
            [payload.bookingId]: existingCount + 1,
          };
        });

        if (payload.bookingId && payload.id && senderId && currentUserId && senderId !== currentUserId) {
          socketInstance.send(`/app/chat.message-delivered/${payload.bookingId}`, {}, String(payload.id));
        }
      });
      socketInstance.subscribe("/user/queue/inbox-update", (message) => {
        try {
          const payload = JSON.parse(message.body);
          if (payload?.bookingId) {
            setUnreadMap((prev) => {
              if (String(payload.bookingId) === String(activeBookingIdRef.current)) return prev;
              return {
                ...prev,
                [payload.bookingId]: Number(prev[payload.bookingId] ?? 0) + 1,
              };
            });
          }
        } catch (err) {
          console.warn("Failed to parse inbox update payload", err);
        }
        fetchConversations();
      });
      socketInstance.subscribe("/user/queue/call-invite", (message) => {
        try {
          const payload = JSON.parse(message.body);
          if (!payload?.bookingId || !payload?.caller) return;
          if (String(payload.bookingId) === String(activeBookingIdRef.current)) return;
          setIncomingCall({
            bookingId: payload.bookingId,
            caller: payload.caller,
            roomId: payload.roomId,
          });
        } catch (err) {
          console.warn("Failed to parse incoming call invite", err);
        }
      });
    });
    setSocket(socketInstance);

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user?.id]);

  const clearIncomingCall = () => {
    setIncomingCall(null);
    setPendingIncomingCallAcceptBookingId(null);
  };

  const acceptIncomingCall = (bookingId) => {
    setPendingIncomingCallAcceptBookingId(bookingId);
    setIncomingCall(null);
  };

  useEffect(() => {
    activeBookingIdRef.current = activeBookingId;
  }, [activeBookingId]);

  const sendMessage = async (bookingId, content) => {
    if (!content?.trim()) return null;
    const response = await api.post(`/chat/${bookingId}/messages`, { content });
    return response.data;
  };

  const value = useMemo(
    () => ({
      conversations,
      totalUnread,
      unreadCounts: unreadMap,
      incomingCall,
      pendingIncomingCallAcceptBookingId,
      activeBookingId,
      setActiveBookingId,
      clearIncomingCall,
      acceptIncomingCall,
      socket,
      fetchConversations,
      sendMessage,
    }),
    [
      conversations,
      totalUnread,
      unreadMap,
      incomingCall,
      pendingIncomingCallAcceptBookingId,
      activeBookingId,
      socket,
      fetchConversations,
      sendMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
