import { useState } from "react";
import {
  Pencil,
  KeyRound,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { changePassword } from "../../api/userApi";

const AccountSettings = ({ profile, onEditClick, onSwitchMode }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess("Password updated successfully.");
      resetPasswordForm();
      setTimeout(() => {
        setShowPasswordForm(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(
        err?.response?.data?.message ||
          "Failed to update password. Please check your current password.",
      );
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>

      <div className="mt-4 divide-y divide-slate-100">
        {/* Edit Profile Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onEditClick) onEditClick();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex w-full items-center justify-between py-3 px-2 text-left transition hover:bg-slate-50 rounded-lg"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <Pencil className="h-4 w-4 text-emerald-600" />
            Edit Profile
          </span>
          <span className="text-xs text-slate-400">Update your details</span>
        </button>

        {/* Change Password Action Button & Form */}
        <div className="py-2">
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm((prev) => !prev);
              resetPasswordForm();
              setPwSuccess("");
            }}
            className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <KeyRound className="h-4 w-4 text-emerald-600" />
              Change Password
            </span>
            <span className="text-xs text-slate-400">
              {showPasswordForm ? "Close" : "Update"}
            </span>
          </button>

          {showPasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4"
            >
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {pwError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  {pwSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        {/* Current Mode Action Button */}
        <button
          type="button"
          onClick={onSwitchMode}
          className="flex w-full items-center justify-between py-3 px-2 text-left transition hover:bg-slate-50 rounded-lg"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
            Current Mode
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {profile?.currentMode === "DRIVER" ? "Driver" : "Passenger"}
          </span>
        </button>

        {/* Future Features */}
        <div className="flex items-center justify-between py-3 px-2 opacity-50">
          <span className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </span>
          <span className="text-xs text-slate-400">Coming soon</span>
        </div>
        <div className="flex items-center justify-between py-3 px-2 opacity-50">
          <span className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Privacy & Security
          </span>
          <span className="text-xs text-slate-400">Coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
