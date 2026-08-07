import React, { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CallButton from "../../components/Call/CallButton";
import CallScreen from "../../components/Call/CallScreen";
import { cleanupAgoraCall, initializeAgoraCall } from "../../services/agoraCall";
import { startRingtone, stopRingtone } from "../../services/ringtone";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeId = (value) => {
  if (value == null) return "";
  if (typeof value === "object") return String(value._id ?? value.id ?? value);
  return String(value);
};

// Handles different possible field names the backend might send
const getSenderId = (message) => {
  return normalizeId(
    message.senderId ?? message.sender ?? message.senderID ?? message.from ?? message.userId
  );
};

const ConversationPage = () => {
  const { bookingId } = useParams();
  const { sendMessage, setActiveBookingId, socket } = useChat();
  const { currentMode, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [seenRequestSent, setSeenRequestSent] = useState(false);
  const messagesContainerRef = useRef(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [callInvite, setCallInvite] = useState(null);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callSession, setCallSession] = useState(null);
  const [isConnectingCall, setIsConnectingCall] = useState(false); // NEW: guard against double-fire

  useEffect(() => {
    setActiveBookingId(bookingId);
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/${bookingId}/messages`);
        const data = Array.isArray(response.data) ? response.data : [];
        setMessages(data);

        // TEMP DEBUG — remove once fixed
        console.log("Logged-in user object:", user);
        console.log("First message object:", data[0]);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => setActiveBookingId(null);
  }, [bookingId, setActiveBookingId, user]);

  const currentUserId = useMemo(() => {
    const id = normalizeId(user?._id ?? user?.id ?? user?.userId ?? user?.user?._id);
    console.log("Computed currentUserId:", id); // TEMP DEBUG
    return id;
  }, [user]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (callInvite) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [callInvite]);

  useEffect(() => {
    if (!socket || !bookingId) return;

    let statusSub = null;
    let messageSub = null;
    let editedSub = null;
    let deletedSub = null;
    let callSub = null;
    let prevOnConnect = null;
    let wrappedOnConnect = false;

    const handleStatusUpdate = (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (!payload?.messageId || !payload?.status) return;

        setMessages((prev) =>
          prev.map((item) =>
            String(item.id) === String(payload.messageId) ? { ...item, status: payload.status } : item,
          ),
        );
      } catch (e) {
        console.warn("Failed to parse status message", e);
      }
    };

    const handleIncomingMessage = (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (!payload?.id && !payload?.messageId) return;

        const normalizedMessage = {
          ...payload,
          id: payload.id ?? payload.messageId,
          senderId: payload.senderId ?? payload.sender?.id ?? payload.sender ?? payload.userId,
          senderName: payload.senderName ?? payload.sender?.name ?? "Unknown",
        };

        setMessages((prev) => {
          const alreadyExists = prev.some((item) => String(item.id ?? item._id) === String(normalizedMessage.id));
          if (alreadyExists) return prev;
          return [...prev, normalizedMessage];
        });
      } catch (e) {
        console.warn("Failed to parse incoming chat message", e);
      }
    };

    const handleEditedUpdate = (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (!payload?.messageId) return;
        setMessages((prev) =>
          prev.map((item) =>
            String(item.id) === String(payload.messageId)
              ? { ...item, content: payload.content, edited: true }
              : item,
          ),
        );
      } catch (e) {
        console.warn("Failed to parse edited message", e);
      }
    };

    const handleDeletedUpdate = (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (!payload?.messageId) return;
        setMessages((prev) =>
          prev.map((item) =>
            String(item.id) === String(payload.messageId)
              ? { ...item, deleted: true, content: "This message was deleted" }
              : item,
          ),
        );
      } catch (e) {
        console.warn("Failed to parse deleted message", e);
      }
    };

    const handleCallInvite = (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (!payload?.bookingId || !payload?.caller) return;
        if (String(payload.bookingId) !== String(bookingId)) return;
        const callerId = normalizeId(payload.caller?.userId);
        if (callerId === currentUserId) return;
        setCallInvite(payload);
      } catch (e) {
        console.warn("Failed to parse call invite", e);
      }
    };

    const subscribeAll = () => {
      try {
        if (!statusSub) statusSub = socket.subscribe(`/topic/chat/${bookingId}/status`, handleStatusUpdate);
        if (!messageSub) messageSub = socket.subscribe(`/topic/chat/${bookingId}`, handleIncomingMessage);
        if (!editedSub) editedSub = socket.subscribe(`/topic/chat/${bookingId}/edited`, handleEditedUpdate);
        if (!deletedSub) deletedSub = socket.subscribe(`/topic/chat/${bookingId}/deleted`, handleDeletedUpdate);
        if (!callSub) callSub = socket.subscribe(`/topic/chat/${bookingId}/call`, handleCallInvite);
      } catch (e) {
        console.warn("Failed to subscribe to chat topics", e);
      }
    };

    if (socket.connected) {
      subscribeAll();
    } else {
      // wrap existing onConnect so we subscribe after the connection is established
      prevOnConnect = socket.onConnect;
      socket.onConnect = (frame) => {
        try {
          prevOnConnect?.(frame);
        } catch (err) {
          console.warn("previous onConnect handler error", err);
        }
        subscribeAll();
      };
      wrappedOnConnect = true;
    }

    return () => {
      try {
        statusSub?.unsubscribe();
      } catch (e) {
        /* ignore */
      }
      try {
        messageSub?.unsubscribe();
      } catch (e) {
        /* ignore */
      }
      try {
        editedSub?.unsubscribe();
      } catch (e) {
        /* ignore */
      }
      try {
        deletedSub?.unsubscribe();
      } catch (e) {
        /* ignore */
      }
      try {
        callSub?.unsubscribe();
      } catch (e) {
        /* ignore */
      }

      // restore previous onConnect if we wrapped it
      if (wrappedOnConnect && prevOnConnect !== null) {
        socket.onConnect = prevOnConnect;
      }

      // Note: do NOT deactivate the shared socket from here. If this component
      // creates its own client instance, call client.deactivate() instead.
    };
  }, [socket, bookingId, currentUserId]);

  const canEditMessage = (message) => {
    const isMine = getSenderId(message) === currentUserId;
    if (!isMine || !message?.sentAt) return false;
    const ageMs = Date.now() - new Date(message.sentAt).getTime();
    return ageMs <= 2 * 60 * 1000 && !message?.deleted;
  };

  const handleOpenEdit = (message) => {
    setEditingMessageId(message.id || message._id);
    setEditDraft(message.content || "");
    setActiveMenuId(null);
  };

  const handleSaveEdit = async (message) => {
    const id = message.id || message._id;
    if (!id || !editDraft.trim()) return;

    try {
      const response = await api.patch(`/chat/message/${id}`, { content: editDraft.trim() });
      setMessages((prev) =>
        prev.map((item) =>
          String(item.id ?? item._id) === String(id)
            ? { ...item, content: response.data.content, edited: true }
            : item,
        ),
      );
      setEditingMessageId(null);
      setEditDraft("");
    } catch (error) {
      console.error("Failed to edit message", error);
    }
  };

  const handleDelete = async (message) => {
    const id = message.id || message._id;
    if (!id) return;

    try {
      await api.delete(`/chat/message/${id}`);
      setMessages((prev) =>
        prev.map((item) =>
          String(item.id ?? item._id) === String(id)
            ? { ...item, deleted: true, content: "This message was deleted" }
            : item,
        ),
      );
      setActiveMenuId(null);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const sendCallInvite = async () => {
    // Guard: block double-fire from rapid clicks or duplicate handlers
    if (isConnectingCall || isCallConnected) return;
    setIsConnectingCall(true);
    console.log("Call button clicked");

    if (!socket || !bookingId || !user) {
      setIsConnectingCall(false);
      return;
    }
    const currentUserInfo = {
      userId: normalizeId(user?._id ?? user?.id ?? user?.userId ?? user?.user?._id),
      name: user?.name ?? user?.email ?? "You",
    };
    try {
      const session = await initializeAgoraCall({
        roomId: bookingId,
        userId: currentUserInfo.userId || `user-${Date.now()}`,
        userName: currentUserInfo.name,
      });
      setCallSession(session);
      setIsCallConnected(true);
      socket.publish({
        destination: `/app/chat.call/${bookingId}`,
        body: JSON.stringify({ bookingId, caller: currentUserInfo }),
      });
    } catch (error) {
      console.error("Failed to start call", error);
    } finally {
      setIsConnectingCall(false);
    }
  };

  const handleAcceptCall = async () => {
    if (isConnectingCall || isCallConnected) return;
    setIsConnectingCall(true);
    try {
      const currentUserInfo = {
        userId: normalizeId(user?._id ?? user?.id ?? user?.userId ?? user?.user?._id),
        name: user?.name ?? user?.email ?? "You",
      };
      const session = await initializeAgoraCall({
        roomId: bookingId,
        userId: currentUserInfo.userId || `user-${Date.now()}`,
        userName: currentUserInfo.name,
      });
      setCallSession(session);
      setIsCallConnected(true);
      setCallInvite(null);
    } catch (error) {
      console.error("Failed to connect call", error);
    } finally {
      setIsConnectingCall(false);
    }
  };

  const handleDeclineCall = () => {
    setCallInvite(null);
  };

  const otherUserName = useMemo(() => {
    const otherMessage = messages.find((message) => getSenderId(message) !== currentUserId);
    return otherMessage?.senderName || messages[0]?.senderName || "Your ride partner";
  }, [messages, currentUserId]);

  const otherInitials = useMemo(() => {
    return otherUserName
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }, [otherUserName]);

  const otherPartyRole = useMemo(() => {
    if (currentMode === "DRIVER") return "Passenger";
    if (currentMode === "PASSENGER") return "Driver";
    return "Ride Partner";
  }, [currentMode]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const saved = await sendMessage(bookingId, draft.trim());
    if (saved) {
      const savedWithSender = {
        ...saved,
        senderId: saved.senderId ?? user?._id ?? user?.id,
        senderName: saved.senderName ?? user?.name ?? "You",
      };
      setMessages((prev) => {
        const alreadyExists = prev.some((item) => String(item.id ?? item._id) === String(savedWithSender.id));
        if (alreadyExists) return prev;
        return [...prev, savedWithSender];
      });
      setDraft("");
    }
  };

  useEffect(() => {
    if (!socket || !bookingId || seenRequestSent || messages.length === 0) return;

    const otherUserHasUnseen = messages.some((message) => {
      const isMine = getSenderId(message) === currentUserId;
      return !isMine && message.status !== "seen";
    });

    if (otherUserHasUnseen) {
      try {
        // STOMP client from @stomp/stompjs uses `publish` (not `send`).
        if (typeof socket.publish === "function" && socket.connected) {
          socket.publish({ destination: `/app/chat.mark-as-seen/${bookingId}`, body: "" });
        } else if (typeof socket.send === "function") {
          // fallback for other socket types
          socket.send(`/app/chat.mark-as-seen/${bookingId}`, {}, "");
        } else {
          console.warn("socket not ready to send mark-as-seen");
        }
      } catch (e) {
        console.warn("failed sending mark-as-seen", e);
      }
      setSeenRequestSent(true);
    }
  }, [socket, bookingId, messages, currentUserId, seenRequestSent]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-20 px-4 pb-8 mb-20 mt-4 ">
        <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-xl font-semibold text-slate-700">
                  {otherInitials}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{otherUserName}</p>
                  <p className="text-sm text-slate-500">{otherPartyRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {callInvite && (
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Incoming call from {callInvite.caller?.name || "someone"}
                  </div>
                )}
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Chat</span>
                  <CallButton
                    onClick={sendCallInvite}
                    label={isConnectingCall ? "Calling..." : "Call"}
                    disabled={isConnectingCall || isCallConnected}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-16rem)] max-h-[calc(100vh-16rem)] flex-col overflow-hidden px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              {callInvite && (
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <span>Incoming call from {callInvite.caller?.name || "someone"}</span>
                  <button type="button" onClick={handleAcceptCall} className="rounded-full bg-emerald-600 px-2 py-1 text-[11px] text-white">Accept</button>
                  <button type="button" onClick={handleDeclineCall} className="rounded-full bg-slate-600 px-2 py-1 text-[11px] text-white">Decline</button>
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex-1">
                <p className="text-sm text-slate-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-3xl bg-slate-50 p-8 text-center">
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Say hello to your driver/passenger and arrange the pickup details here.
                </p>
              </div>
            ) : (
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pr-1">
                <div className="space-y-6">
                  {messages.map((message) => {
                    const isMine = getSenderId(message) === currentUserId;
                    const senderName = message.senderName || (isMine ? "You" : "Unknown");

                    return (
                      <div
                        key={message.id || message._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className="w-full max-w-[75%]">
                          {!isMine && (
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                {senderName?.charAt(0).toUpperCase() || "U"}
                              </span>
                              <span>{senderName}</span>
                            </div>
                          )}

                          <div
                            className={`relative rounded-[28px] p-4 shadow-sm ${
                              isMine ? "ml-auto bg-emerald-600 text-white cursor-pointer" : "bg-slate-100 text-slate-700"
                            }`}
                            onClick={() => {
                              if (!isMine || message.deleted) return;
                              setActiveMenuId((current) => (current === (message.id || message._id) ? null : (message.id || message._id)));
                            }}
                          >
                            {isMine && !message.deleted && (
                              <button
                                type="button"
                                className={`absolute right-2 top-2 rounded-full p-1 ${isMine ? "text-emerald-100 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}
                                onClick={() => setActiveMenuId(activeMenuId === (message.id || message._id) ? null : (message.id || message._id))}
                              >
                                <MoreVertical size={16} />
                              </button>
                            )}

                            {activeMenuId === (message.id || message._id) && isMine && !message.deleted && (
                              <div className={`absolute right-2 top-9 z-10 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ${isMine ? "text-slate-700" : "text-slate-700"}`}>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                                  onClick={() => handleOpenEdit(message)}
                                  disabled={!canEditMessage(message)}
                                >
                                  <Pencil size={14} />
                                  {canEditMessage(message) ? "Edit" : "Edit (expired)"}
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                                  onClick={() => handleDelete(message)}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            )}

                            {editingMessageId === (message.id || message._id) ? (
                              <div className="space-y-2">
                                <input
                                  value={editDraft}
                                  onChange={(e) => setEditDraft(e.target.value)}
                                  className="w-full rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                                    onClick={() => handleSaveEdit(message)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditDraft("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className={`text-sm leading-6 ${message.deleted ? "italic text-slate-300" : ""}`}>
                                  {message.deleted ? "This message was deleted" : message.content}
                                </p>
                                {message.edited && !message.deleted && (
                                  <p className={`mt-1 text-[10px] ${isMine ? "text-emerald-100/80" : "text-slate-500"}`}>
                                    Edited
                                  </p>
                                )}
                                <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                                  <span className={isMine ? "text-emerald-100/90" : "text-slate-500"}>
                                    {formatTimestamp(message.sentAt)}
                                  </span>
                                  {isMine && message.status && (
                                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                                      {message.status}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isCallConnected && (
            <CallScreen
              isConnected={isCallConnected}
              onConnect={() => setIsCallConnected(true)}
              onMuteToggle={() => setIsMuted((prev) => !prev)}
              muted={isMuted}
              onEndCall={async () => {
                if (callSession) {
                  await cleanupAgoraCall(callSession);
                  setCallSession(null);
                }
                setIsCallConnected(false);
              }}
            />
          )}

          <form onSubmit={handleSend} className="border-t border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                placeholder="Type a message"
              />
              <button
                type="submit"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConversationPage;
