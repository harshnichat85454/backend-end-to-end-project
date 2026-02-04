import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!avatar) {
      setError("Avatar image is required to create an account.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", formState.fullName);
    formData.append("userName", formState.userName);
    formData.append("email", formState.email);
    formData.append("password", formState.password);
    formData.append("avatar", avatar);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      setIsSubmitting(true);
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-12">
        <div className="lg:w-1/2">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
            Get started
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">
            Build your creator profile and connect with your audience.
          </h1>
          <p className="mt-6 text-base text-slate-300">
            Upload an avatar, add a cover image, and secure your account with a
            strong password.
          </p>
        </div>

        <div className="mt-10 w-full rounded-3xl bg-white/5 p-8 shadow-lg shadow-black/40 backdrop-blur lg:mt-0 lg:w-[460px]">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-2 text-sm text-slate-300">
            All fields are required, including a profile avatar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Full name
              <input
                name="fullName"
                value={formState.fullName}
                onChange={handleChange}
                placeholder="Jamie Creator"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Username
              <input
                name="userName"
                value={formState.userName}
                onChange={handleChange}
                placeholder="jamie"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="jamie@studio.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 capital, 1 symbol"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Avatar (required)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Cover image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setCoverImage(event.target.files?.[0] ?? null)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
