import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import useAuth from "../context/useAuth";

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🚨 REQUIRED

    try {
      setError("");
      setIsSubmitting(true);
      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { userName: identifier, password };
      const res = await loginUser({
        ...payload,
      });
      setUser(res.data.data?.user ?? res.data.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-12">
        <div className="lg:w-1/2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Backend ready
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">
            Sign in to your creator dashboard and manage content in one place.
          </h1>
          <p className="mt-6 text-base text-slate-300">
            Access analytics, update your profile, and connect with your
            community using the secured API.
          </p>
        </div>

        <div className="mt-10 w-full rounded-3xl bg-white/5 p-8 shadow-lg shadow-black/40 backdrop-blur lg:mt-0 lg:w-[420px]">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-300">
            Use your username or email to sign in.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Username or email
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="yourname or name@email.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                required
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
              className="flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            New here?{" "}
            <Link to="/register" className="font-semibold text-emerald-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
