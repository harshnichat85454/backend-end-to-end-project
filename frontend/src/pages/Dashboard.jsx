import useAuth from "../context/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-emerald-300 p-8 text-slate-900 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-800/70">
          Creator Overview
        </p>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back, {user?.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-800/80">
              Manage your profile, update content, and keep your channel fresh.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/50 bg-white/70">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user?.fullName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold">@{user?.userName}</p>
              <p className="text-xs text-slate-800/70">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Profile readiness",
            description:
              "Upload a cover image and keep your bio updated to build trust.",
          },
          {
            title: "Security check",
            description:
              "Update your password regularly and review login activity.",
          },
          {
            title: "Audience touchpoints",
            description:
              "Publish new videos, playlists, and posts to stay visible.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
