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

export async function wallLogin(email: string): Promise<WallUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const json: ApiResponse<{ user: WallUser; token: string }> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Login failed");
  }
  setWallSession(json.data.token, json.data.user);
  return json.data.user;
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
  const json: ApiResponse<{ user: WallUser }> = await res.json();
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
