const API_BASE = import.meta.env.VITE_API_URL || "/api/wall";
const TOKEN_KEY = "wall_auth_token";
const USER_KEY = "wall_user";

export interface WallUser {
  id: number;
  name: string;
  designation: string;
  teamEntity: string;
  email: string;
  role: string;
  initials: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function getWallToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getWallUser(): WallUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WallUser;
  } catch {
    return null;
  }
}

export function setWallSession(token: string, user: WallUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearWallSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseWallResponse<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json().catch(() => ({
    success: false,
    message: "Invalid response",
    data: null as unknown as T,
  }));
}

export async function wallCheckEmail(
  email: string
): Promise<{ requiresPasswordSetup: boolean }> {
  const res = await fetch(`${API_BASE}/auth/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const json = await parseWallResponse<{ requiresPasswordSetup: boolean }>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Could not verify email");
  }
  return json.data ?? { requiresPasswordSetup: false };
}

export async function wallLogin(
  email: string,
  password: string,
  confirmPassword?: string
): Promise<WallUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      ...(confirmPassword !== undefined ? { confirmPassword } : {}),
    }),
  });
  const json = await parseWallResponse<{ user: WallUser; token: string }>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Login failed");
  }
  setWallSession(json.data.token, json.data.user);
  return json.data.user;
}

export interface WallForgotPasswordResult {
  resetUrl?: string;
  resetPath?: string;
}

export async function wallForgotPassword(
  email: string
): Promise<WallForgotPasswordResult> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const json = await parseWallResponse<WallForgotPasswordResult>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Could not start password reset");
  }
  return json.data || {};
}

export async function wallResetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  const json = await parseWallResponse<unknown>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Could not reset password");
  }
}

export async function wallLogout() {
  clearWallSession();
}

export async function fetchWallMe(): Promise<WallUser | null> {
  const token = getWallToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseWallResponse<{ user: WallUser }>(res);
  if (!res.ok || !json.success) {
    clearWallSession();
    return null;
  }
  setWallSession(token, json.data.user);
  return json.data.user;
}

export function wallAuthHeaders(): HeadersInit {
  const token = getWallToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Client-side hint for password rules (matches backend). */
export function validateWallPasswordClient(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must include at least one letter";
  if (!/[0-9]/.test(password)) return "Password must include at least one number";
  return null;
}
