import React from "react";
import OTPVerificationCard from "./OTPVerificationCard";

const OTPModal = ({
  isOpen,
  email,
  onClose,
  onVerifySuccess,
  isLoading = false,
  otpExpiresAt,
  title = "Verify Your Email",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <OTPVerificationCard
          email={email}
          onVerifySuccess={onVerifySuccess}
          onCancel={onClose}
          isLoading={isLoading}
          otpExpiresAt={otpExpiresAt}
        />
      </div>
    </div>
  );
};

export default OTPModal;
