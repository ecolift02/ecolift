import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ConversationPage = () => {
  const { bookingId } = useParams();
  const { sendMessage, setActiveBookingId } = useChat();
  const { currentMode } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveBookingId(bookingId);
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/${bookingId}/messages`);
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => setActiveBookingId(null);
  }, [bookingId]);

  const currentUserId = useMemo(() => {
    const storedUser = localStorage.getItem("user_data");
    return storedUser ? JSON.parse(storedUser).id : null;
  }, []);

  const groupedMessages = useMemo(() => {
    const groups = [];
    messages.forEach((message) => {
      const isMine = message.senderId === currentUserId;
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.isMine !== isMine) {
        groups.push({
          isMine,
          senderName: message.senderName,
          messages: [message],
        });
      } else {
        lastGroup.messages.push(message);
      }
    });
    return groups;
  }, [messages, currentUserId]);

  const otherUserName = useMemo(() => {
    const otherMessage = messages.find((message) => message.senderId !== currentUserId);
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
      setMessages((prev) => [...prev, saved]);
      setDraft("");
    }
  };

  return (
    <>
    <Navbar/>
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
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Chat
            </span>
          </div>
        </div>

        <div className="flex h-[calc(100vh-16rem)] max-h-[calc(100vh-16rem)] flex-col overflow-hidden px-5 py-4">
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
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="space-y-6">
                {groupedMessages.map((group, index) => (
                  <div
                    key={`group-${index}`}
                    className={`flex ${group.isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className="w-full max-w-[75%]">
                      {!group.isMine && (
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            {group.senderName?.charAt(0).toUpperCase() || "U"}
                          </span>
                          <span>{group.senderName}</span>
                        </div>
                      )}
                      <div className="space-y-3">
                        {group.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-[28px] p-4 shadow-sm ${group.isMine ? "ml-auto bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                          >
                            <p className="text-sm leading-6">{message.content}</p>
                            <span
                              className={`mt-3 block text-right text-[11px] ${group.isMine ? "text-emerald-100/90" : "text-slate-500"}`}
                            >
                              {formatTimestamp(message.sentAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
