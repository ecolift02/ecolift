import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import PersonalInfoCard from "../../components/Profile/PersonalInfoCard";
import EditProfileForm from "../../components/Profile/EditProfileForm";
import AccountInfoCard from "../../components/Profile/AccountInfoCard";
import ProfileStats from "../../components/Profile/ProfileStats";
import AccountSettings from "../../components/Profile/AccountSettings";
import { getProfile, updateProfile } from "../../api/userApi";

// Acts only as the page container: fetches the profile once, owns the
// edit/save/cancel state, and hands data + callbacks down to the
// presentational components in components/Profile/. No rendering logic
// lives here beyond composing those pieces.
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setLoadError(
        err?.response?.data?.message ||
          "Unable to load your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
          "Failed to save your changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-1 text-sm text-emerald-50">
              View and manage your EcoLift account
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-10">
          {loading && (
            <p className="text-center text-slate-500 py-10">
              Loading your profile...
            </p>
          )}

          {!loading && loadError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {loadError}
            </div>
          )}

          {!loading && !loadError && profile && (
            <>
              <ProfileHeader profile={profile} onPictureUpdated={setProfile} />

              {isEditing ? (
                <EditProfileForm
                  profile={profile}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  saving={saving}
                  error={saveError}
                />
              ) : (
                <PersonalInfoCard
                  profile={profile}
                  onEditClick={() => setIsEditing(true)}
                />
              )}

              <AccountInfoCard profile={profile} />

              <ProfileStats profile={profile} />

              <AccountSettings
                profile={profile}
                onEditClick={() => setIsEditing(true)}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default UserProfile;
