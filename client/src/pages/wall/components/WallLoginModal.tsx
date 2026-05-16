import { useEffect, useState } from "react";
import { useWallAuth } from "../../../context/WallAuthContext";

export default function WallLoginModal() {
  const { loginOpen, closeLogin, login } = useWallAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loginOpen) {
      setEmail("");
      setError(null);
      setSubmitting(false);
    }
  }, [loginOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && loginOpen) closeLogin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginOpen, closeLogin]);

  if (!loginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wall-login-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={closeLogin}
        aria-label="Close sign in"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden animate-scale-in">
        <button
          type="button"
          onClick={closeLogin}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer z-10"
          aria-label="Close"
        >
          <i className="ri-close-line text-lg"></i>
        </button>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5 pr-8">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <i className="ri-mail-line text-xl"></i>
            </div>
            <div>
              <h2 id="wall-login-title" className="text-lg font-sans font-semibold text-gray-900">
                Sign in to post
              </h2>
              <p className="text-xs font-sans text-gray-500 mt-0.5">
                Enter your official Refex email to share on The Wall
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wall-login-email" className="block text-xs font-sans text-gray-500 mb-1.5">
                Work email
              </label>
              <input
                id="wall-login-email"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@refex.co.in"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-xs font-sans text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className={`w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all ${
                submitting || !email.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg"
              }`}
            >
              {submitting ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
