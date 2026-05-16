import { useState, FormEvent, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { authLogin, adminLogout, getAdminToken } from "../../services/cmsApi";
import { CMS_ADMIN_SAMPLE } from "../../config/adminSample";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800/80"
  }`;

export default function AdminLayout() {
  const [session, setSession] = useState<string | null>(() => getAdminToken());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isDev) {
      setEmail(CMS_ADMIN_SAMPLE.email);
      setPassword(CMS_ADMIN_SAMPLE.password);
    }
  }, [isDev]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const r = await authLogin(email.trim(), password);
    if (!r.ok) setLoginError(r.message || "Login failed");
    else setSession(getAdminToken());
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md border border-slate-700 rounded-2xl p-8 bg-slate-900/80">
          <h1 className="text-xl font-semibold mb-1">Site CMS</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in to edit site content</p>
          {isDev && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-200/90">
              <p className="font-medium text-amber-400 mb-1">Development sample</p>
              <p>
                Email <span className="font-mono text-slate-200">{CMS_ADMIN_SAMPLE.email}</span>
              </p>
              <p>
                Password <span className="font-mono text-slate-200">{CMS_ADMIN_SAMPLE.password}</span>
              </p>
              <p className="mt-1 text-slate-500">
                Run in backend: <span className="font-mono">npm run seed:cms-admin</span>
              </p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400"
            >
              Sign in
            </button>
          </form>
          <Link to="/" className="block text-center text-xs text-slate-500 mt-6 hover:text-amber-400">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-56 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Content</p>
          <p className="text-sm font-semibold text-amber-400">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/cms/home-hero" className={navLinkClass} end>
            Home page
          </NavLink>
          <NavLink to="/admin/cms/vision" className={navLinkClass}>
            Vision page
          </NavLink>
          <NavLink to="/admin/cms/site-chrome" className={navLinkClass}>
            Navbar & footer
          </NavLink>
          <NavLink to="/admin/cms/wall" className={navLinkClass}>
            Wall page
          </NavLink>
          <NavLink to="/admin/wall/users" className={navLinkClass}>
            Wall users
          </NavLink>
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="block text-center text-xs py-2 rounded-lg border border-slate-700 text-amber-400 hover:bg-slate-800"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => {
              adminLogout();
              setSession(null);
            }}
            className="w-full text-xs py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
