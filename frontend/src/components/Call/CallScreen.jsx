import React from "react";

const CallScreen = ({ isConnected, onConnect, onMuteToggle, muted, onEndCall }) => {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        {isConnected ? "Call active" : "Call ready"}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConnect}
          className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Connect
        </button>
        <button
          type="button"
          onClick={onMuteToggle}
          className="rounded-full bg-slate-700 px-3 py-2 text-sm font-semibold text-white"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={onEndCall}
          className="rounded-full bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
