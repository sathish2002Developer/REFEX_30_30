import { useState } from "react";
import { wallLogin, type WallUser } from "../../../services/wallAuth";

interface WallLoginProps {
  onSuccess: (user: WallUser) => void;
}

export default function WallLogin({ onSuccess }: WallLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await wallLogin(email, password);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <motionlessDialogShellInnerBodyIcon />
        <div>
          <h3 className="text-base font-sans font-semibold text-gray-900">Sign in to The Wall</h3>
          <p className="text-xs font-sans text-gray-500">Use your official Refex email and password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wall-email" className="block text-xs font-sans text-gray-500 mb-1.5">
            Work email
          </label>
          <input
            id="wall-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@refex.co.in"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label htmlFor="wall-password" className="block text-xs font-sans text-gray-500 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="wall-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs font-sans text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className={`w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all ${
            loading || !email.trim() || !password
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function motionlessDialogShellInnerBodyIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
      <i className="ri-user-smile-line text-lg"></i>
    </div>
  );
}
