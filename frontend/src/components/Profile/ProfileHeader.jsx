import { useRef, useState } from "react";
import { Mail, Phone, CalendarClock, Camera, Loader2 } from "lucide-react";
import { uploadProfilePicture } from "../../api/userApi";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTXEqeXb5oMyQbf1hR_m59FLXF81K1UzNc300uKHMGjM_4kHPRyedHC2m4sirqtGwkISVtDsxdYa6FnhQJ_3RY5OskpVuPlEKu6NRYsEGQjQUCILUNSbCIpi8XbIW2PqJ-_yc6nwknNGb0bDskAn4_z6sCdeCsOaRjL0zYCKJ-lgjobRKMy7Rx_xVuOq60y31HjSDwRGQR9YgsJamE6F31g2kO8CY1Zidr6cdK7inh_bkIDXD8W78fcW2GT2edMpT6Q4yGHfD4ubw";

const formatJoinedDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

// profile: the current profile object.
// onPictureUpdated: called with the fresh profile (new profilePictureUrl)
// after a successful upload, so the parent page can update its state.
const ProfileHeader = ({ profile, onPictureUpdated }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!profile) return null;

  const isDriver = profile.currentMode === "DRIVER";

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    // Always reset the input value so choosing the same file twice in a
    // row still fires onChange.
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const updatedProfile = await uploadProfilePicture(file);
      onPictureUpdated?.(updatedProfile);
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          "Couldn't upload that image. Please try a JPEG/PNG/WEBP under 5MB."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="group relative block h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-md ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Click to change your profile picture"
          >
            <img
              src={profile.profilePictureUrl || DEFAULT_AVATAR}
              alt={profile.name || "Profile"}
              className="h-full w-full object-cover"
            />
            {/* Hover / uploading overlay with a camera icon */}
            <span
              className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {profile.name}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isDriver
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isDriver ? "Driver Mode" : "Passenger Mode"}
            </span>
          </div>

          {uploadError && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {uploadError}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <span className="flex items-center justify-center gap-1.5 sm:justify-start">
              <Mail className="h-4 w-4" />
              {profile.email}
            </span>
            <span className="flex items-center justify-center gap-1.5 sm:justify-start">
              <Phone className="h-4 w-4" />
              {profile.phone || "Not added"}
            </span>
            <span className="flex items-center justify-center gap-1.5 sm:justify-start">
              <CalendarClock className="h-4 w-4" />
              Member since {formatJoinedDate(profile.joinedDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
