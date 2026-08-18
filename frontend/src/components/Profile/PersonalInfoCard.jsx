import { Pencil } from "lucide-react";

const formatDob = (value) => {
  if (!value) return "Not added";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-800">
      {value || "Not added"}
    </p>
  </div>
);

const PersonalInfoCard = ({ profile, onEditClick }) => {
  if (!profile) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Personal Information
        </h2>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Profile
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name" value={profile.name} />
        <Field label="Phone Number" value={profile.phone} />
        <Field label="Gender" value={profile.gender} />
        <Field label="Date of Birth" value={formatDob(profile.dateOfBirth)} />
      </div>
    </div>
  );
};

export default PersonalInfoCard;
