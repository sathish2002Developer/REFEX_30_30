import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useWallAuth } from "../../../context/WallAuthContext";
import {
  validateWallPasswordClient,
  wallCheckEmail,
  wallForgotPassword,
} from "../../../services/wallAuth";

type View = "signin" | "forgot";

export default function WallLoginModal() {
  const { loginOpen, closeLogin, login } = useWallAuth();
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loginOpen) {
      setView("signin");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setNeedsSetup(false);
      setCheckingEmail(false);
      setEmailCheckError(null);
      setShowPassword(false);
      setError(null);
      setForgotSuccess(null);
      setSubmitting(false);
    }
  }, [loginOpen]);

  useEffect(() => {
    if (!loginOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogin();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [loginOpen, closeLogin]);

  const runEmailCheck = async (trimmed: string) => {
    setCheckingEmail(true);
    setEmailCheckError(null);
    try {
      const { requiresPasswordSetup } = await wallCheckEmail(trimmed);
      setNeedsSetup(requiresPasswordSetup);
      if (!requiresPasswordSetup) setConfirmPassword("");
      return requiresPasswordSetup;
    } catch (err) {
      setNeedsSetup(false);
      setEmailCheckError(err instanceof Error ? err.message : "Could not verify email");
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setNeedsSetup(false);
      setEmailCheckError(null);
      return;
    }

    const timer = setTimeout(() => {
      void runEmailCheck(trimmed);
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  if (!loginOpen || !mounted) return null;

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    setSubmitting(true);
    try {
      const requiresPasswordSetup = await runEmailCheck(trimmedEmail);

      if (requiresPasswordSetup) {
        const validationError = validateWallPasswordClient(password);
        if (validationError) {
          setError(validationError);
          return;
        }
        if (!confirmPassword) {
          setError("Please confirm your password");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
      }

      await login(
        trimmedEmail,
        password,
        requiresPasswordSetup ? confirmPassword : undefined
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not sign in";
      setError(msg);
      const needsSetupFlag =
        err instanceof Error &&
        "requiresPasswordSetup" in err &&
        Boolean((err as Error & { requiresPasswordSetup?: boolean }).requiresPasswordSetup);
      if (
        needsSetupFlag ||
        /confirm your password/i.test(msg) ||
        /passwords do not match/i.test(msg) ||
        /create your password|first.?time|password setup/i.test(msg)
      ) {
        setNeedsSetup(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(null);
    setSubmitting(true);
    try {
      const msg = await wallForgotPassword(email);
      setForgotSuccess(`${msg} Check your inbox and spam folder.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send password email");
    } finally {
      setSubmitting(false);
    }
  };

  const title = view === "signin" ? "Sign in to post" : "Reset your password";
  const subtitle =
    view === "signin"
      ? needsSetup
        ? "First-time setup — create a password for your Wall account"
        : "Enter your Refex email and password to share on The Wall"
      : "Enter your work email. We will send your Wall password if the account exists.";

  return createPortal(
    <LoginModalShell closeLogin={closeLogin} title={title} subtitle={subtitle}>
      {view === "signin" ? (
        <form onSubmit={handleSignIn} className="wall-login-modal__form m-0 p-0">
          <EmailField
            email={email}
            setEmail={setEmail}
            autoFocus
            onBlur={() => {
              const trimmed = email.trim();
              if (trimmed.includes("@")) void runEmailCheck(trimmed);
            }}
          />

          {needsSetup && (
            <p className="m-0 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-sans text-amber-900">
              First-time sign-in: create a password below (8+ characters, letter and number).
            </p>
          )}

          {emailCheckError && (
            <p className="m-0 mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-sans text-amber-800">
              {emailCheckError}
            </p>
          )}

          <PasswordField
            id="wall-login-password"
            label={needsSetup ? "Create password" : "Password"}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            autoComplete={needsSetup ? "new-password" : "current-password"}
            hint={
              needsSetup
                ? "At least 8 characters, with one letter and one number"
                : checkingEmail
                  ? "Checking your account…"
                  : undefined
            }
          />

          {needsSetup && (
            <PasswordField
              id="wall-login-confirm"
              label="Confirm password"
              password={confirmPassword}
              setPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
            />
          )}

          {!needsSetup && (
            <div className="mt-1 mb-2 flex justify-end m-0 p-0">
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError(null);
                }}
                className="m-0 border-0 bg-transparent p-0 text-xs font-sans text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          <SubmitButton
            disabled={
              submitting ||
              checkingEmail ||
              !!emailCheckError ||
              !email.trim() ||
              !password ||
              (needsSetup && !confirmPassword)
            }
            label={
              submitting
                ? needsSetup
                  ? "Saving…"
                  : "Signing in…"
                : needsSetup
                  ? "Create password & sign in"
                  : "Sign in"
            }
          />
        </form>
      ) : (
        <form onSubmit={handleForgot} className="wall-login-modal__form m-0 p-0">
          <EmailField email={email} setEmail={setEmail} autoFocus />

          {forgotSuccess && (
            <p className="m-0 mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-sans text-emerald-700">
              {forgotSuccess}
            </p>
          )}

          {error && <ErrorBanner message={error} />}

          <SubmitButton
            disabled={submitting || !email.trim()}
            label={submitting ? "Sending…" : "Send password to email"}
          />

          <button
            type="button"
            onClick={() => {
              setView("signin");
              setError(null);
              setForgotSuccess(null);
            }}
            className="mt-3 w-full border-0 bg-transparent p-0 text-center text-xs font-sans text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Back to sign in
          </button>
        </form>
      )}
    </LoginModalShell>,
    document.body
  );
}

function LoginModalShell(props: {
  closeLogin: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <LoginModalFrame closeLogin={props.closeLogin} title={props.title} subtitle={props.subtitle}>
      {props.children}
    </LoginModalFrame>
  );
}

function LoginModalFrame(props: {
  closeLogin: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="wall-login-modal fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wall-login-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer border-0 p-0 m-0"
        onClick={props.closeLogin}
        aria-label="Close sign in"
      />

      <div className="wall-login-modal__card relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-100 box-border">
        <button
          type="button"
          onClick={props.closeLogin}
          className="absolute top-4 right-4 z-20 m-0 flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          aria-label="Close"
        >
          <i className="ri-close-line text-lg" aria-hidden />
        </button>

        <div className="wall-login-modal__body box-border">
          <header className="wall-login-modal__header flex items-start gap-3 pr-10 mb-6 m-0 p-0">
            <div className="m-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 p-0 text-amber-700">
              <i className="ri-lock-password-line text-xl" aria-hidden />
            </div>
            <LoginModalHeaderText title={props.title} subtitle={props.subtitle} />
          </header>
          {props.children}
        </div>
      </div>
    </div>
  );
}

function LoginModalHeaderText(props: { title: string; subtitle: string }) {
  return (
    <div className="min-w-0 flex-1 pt-0.5 m-0 p-0">
      <h2
        id="wall-login-title"
        className="m-0 p-0 text-lg font-sans font-semibold text-gray-900 leading-snug"
      >
        {props.title}
      </h2>
      <p className="m-0 mt-1.5 p-0 text-xs font-sans text-gray-500 leading-relaxed">
        {props.subtitle}
      </p>
    </div>
  );
}

function EmailField(props: {
  email: string;
  setEmail: (v: string) => void;
  autoFocus?: boolean;
  onBlur?: () => void;
}) {
  return (
    <div className="wall-login-modal__field m-0 mb-4 p-0">
      <label htmlFor="wall-login-email" className="wall-login-modal__label">
        Work email
      </label>
      <input
        id="wall-login-email"
        type="email"
        autoFocus={props.autoFocus}
        value={props.email}
        onChange={(e) => props.setEmail(e.target.value)}
        onBlur={props.onBlur}
        placeholder="Your Email ID"
        required
        className="wall-login-modal__input"
      />
    </div>
  );
}

function PasswordField(props: {
  id: string;
  label: string;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  autoComplete: string;
  autoFocus?: boolean;
  hint?: string;
}) {
  return (
    <div className="wall-login-modal__field m-0 mb-4 p-0">
      <label htmlFor={props.id} className="wall-login-modal__label">
        {props.label}
      </label>
      <div className="relative m-0 p-0">
        <input
          id={props.id}
          type={props.showPassword ? "text" : "password"}
          value={props.password}
          onChange={(e) => props.setPassword(e.target.value)}
          placeholder="Your Email Password"
          required
          minLength={8}
          autoComplete={props.autoComplete}
          autoFocus={props.autoFocus}
          className="wall-login-modal__input pr-11"
        />
        <button
          type="button"
          onClick={() => props.setShowPassword(!props.showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 m-0 border-0 bg-transparent p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label={props.showPassword ? "Hide password" : "Show password"}
        >
          <i
            className={props.showPassword ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"}
            aria-hidden
          />
        </button>
      </div>
      {props.hint && (
        <p className="m-0 mt-1.5 p-0 text-[11px] font-sans text-gray-500">{props.hint}</p>
      )}
    </div>
  );
}

function SubmitButton(props: { disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={props.disabled}
      className={`mt-2 w-full rounded-xl border-0 py-3 font-sans text-sm font-semibold transition-all ${
        props.disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "cursor-pointer bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg"
      }`}
    >
      {props.label}
    </button>
  );
}

function ErrorBanner(props: { message: string }) {
  return (
    <p
      className="m-0 mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-sans text-red-600"
      role="alert"
    >
      {props.message}
    </p>
  );
}
