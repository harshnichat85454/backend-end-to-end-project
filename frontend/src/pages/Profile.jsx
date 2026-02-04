import { useEffect, useState } from "react";
import {
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../api/auth.api";
import useAuth from "../context/useAuth";

const initialPasswordState = {
  oldPassword: "",
  newPassword: "",
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profileState, setProfileState] = useState({
    fullName: "",
    userName: "",
    email: "",
  });
  const [passwordState, setPasswordState] = useState(initialPasswordState);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    setProfileState({
      fullName: user?.fullName ?? "",
      userName: user?.userName ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileState((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      await updateAccountDetails(profileState);
      await refreshUser();
      setStatus("Account details updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      await changePassword(passwordState);
      setPasswordState(initialPasswordState);
      setStatus("Password updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!avatarFile) return;
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      await updateAvatar(formData);
      await refreshUser();
      setAvatarFile(null);
      setStatus("Avatar updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update avatar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpdate = async () => {
    if (!coverFile) return;
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", coverFile);
      await updateCoverImage(formData);
      await refreshUser();
      setCoverFile(null);
      setStatus("Cover image updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update cover image.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user?.fullName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.fullName}</h2>
              <p className="text-sm text-slate-500">@{user?.userName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Change avatar
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setAvatarFile(event.target.files?.[0] ?? null)
                }
                className="text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-200 file:px-2 file:py-1"
              />
            </label>
            <button
              type="button"
              onClick={handleAvatarUpdate}
              disabled={!avatarFile || isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save avatar
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            Upload cover image
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setCoverFile(event.target.files?.[0] ?? null)
              }
              className="text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-200 file:px-2 file:py-1"
            />
          </label>
          <button
            type="button"
            onClick={handleCoverUpdate}
            disabled={!coverFile || isSaving}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save cover image
          </button>
        </div>
        {user?.coverImage ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <img
              src={user.coverImage}
              alt="Cover"
              className="h-48 w-full object-cover"
            />
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleAccountUpdate}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Account details
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Keep your profile details up to date for your audience.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                name="fullName"
                value={profileState.fullName}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                name="userName"
                value={profileState.userName}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={profileState.email}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save account details
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordUpdate}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Password reset
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Rotate your password regularly to keep your account secure.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Current password
              <input
                type="password"
                name="oldPassword"
                value={passwordState.oldPassword}
                onChange={handlePasswordChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                name="newPassword"
                value={passwordState.newPassword}
                onChange={handlePasswordChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Update password
            </button>
          </div>
        </form>
      </section>

      {(status || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || status}
        </div>
      )}
    </div>
  );
}
