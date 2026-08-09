import React from "react";

const CallButton = ({ onClick, disabled = false, label = "Start Call" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {label}
    </button>
  );
};

export default CallButton;
