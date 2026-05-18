import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  validateWallPasswordClient,
  wallResetPassword,
} from "../../services/wallAuth";

export default function WallResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset link. Request a new link from the sign-in screen.");
      return;
    }

    const validationError = validateWallPasswordClient(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await wallResetPassword(token, password, confirmPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <ResetPageShell>
        <h1 className="text-lg font-sans font-semibold text-gray-900 mb-2">
          Invalid reset link
        </h1>
        <p className="text-sm font-sans text-gray-600 mb-6">
          This link is missing or incomplete. Use Forgot password on The Wall to get a new
          link.
        </p>
        <Link
          to="/wall"
          className="block w-full py-3 rounded-xl font-sans font-semibold text-sm text-center bg-amber-600 text-white hover:bg-amber-700"
        >
          Go to The Wall
        </Link>
      </ResetPageShell>
    );
  }

  return (
    <ResetPageShell>
      <ResetHeader
        title="Set a new password"
        subtitle="At least 8 characters, with one letter and one number"
      />

      {done ? (
        <div className="space-y-4">
          <p className="text-sm font-sans text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Your password has been updated. You can sign in on The Wall with your new
            password.
          </p>
          <button
            type="button"
            onClick={() => navigate("/wall")}
            className="w-full py-3 rounded-xl font-sans font-semibold text-sm bg-amber-600 text-white hover:bg-amber-700 cursor-pointer border-0"
          >
            Go to The Wall
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="wall-new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
          />
          <PasswordInput
            id="wall-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
          />
          {error && (
            <p
              className="text-xs font-sans text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !password || !confirmPassword}
            className={`w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all border-0 ${
              submitting || !password || !confirmPassword
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
            }`}
          >
            {submitting ? "Saving…" : "Update password"}
          </button>
          <p className="text-center text-xs font-sans text-gray-500">
            <Link to="/wall" className="text-amber-700 hover:underline">
              Back to The Wall
            </Link>
          </p>
        </form>
      )}
    </ResetPageShell>
  );
}

function ResetPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-100 p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

function ResetHeader(props: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
        <i className="ri-lock-password-line text-xl" aria-hidden />
      </div>
      <div>
        <h1 className="text-lg font-sans font-semibold text-gray-900">{props.title}</h1>
        <p className="text-xs font-sans text-gray-500 mt-0.5">{props.subtitle}</p>
      </div>
    </div>
  );
}

function PasswordInput(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-xs font-sans text-gray-500 mb-1.5">
        {props.label}
      </label>
      <div className="relative">
        <input
          id={props.id}
          type={props.show ? "text" : "password"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm font-sans text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white"
        />
        <button
          type="button"
          onClick={props.onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent p-1"
          aria-label={props.show ? "Hide password" : "Show password"}
        >
          <i className={props.show ? "ri-eye-off-line" : "ri-eye-line"} aria-hidden />
        </button>
      </div>
    </div>
  );
}
