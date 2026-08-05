import React from "react";
import { Link } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Inbox = () => {
  const { conversations } = useChat();

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-slate-50 pt-20 px-4 py-8 mt-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
            <p className="text-sm text-slate-500">Your confirmed booking conversations</p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No conversations yet.
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div key={conversation.bookingId} className={`rounded-xl border p-4 ${conversation.locked ? "border-slate-200 bg-slate-50 text-slate-500" : "border-emerald-200 bg-white"}`}>
                {conversation.locked ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{conversation.otherPartyName || "Conversation"}</p>
                        <p className="text-sm">{conversation.lastMessage || "No messages yet"}</p>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs">Locked</span>
                    </div>
                    <p className="text-xs text-slate-500">Available once your booking is confirmed</p>
                  </div>
                ) : (
                  <Link to={`/inbox/${conversation.bookingId}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-slate-800">{conversation.otherPartyName || "Conversation"}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-500">{conversation.lastMessage || "Start the conversation"}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>{formatTime(conversation.lastMessageAt)}</div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Inbox;
