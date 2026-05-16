import type { HomeHeroConfig } from "../types/homeHeroCms";
import type { VisionPageCms } from "../types/visionCms";
import type { SiteChromeCms } from "../types/siteChromeCms";
import type { WallPageCms } from "../types/wallPageCms";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const CMS_BASE = "/api/cms";
const ADMIN_BASE = "/api/admin";

export async function fetchHomeHeroConfig(): Promise<HomeHeroConfig | null> {
  try {
    const res = await fetch(`${CMS_BASE}/home-hero`);
    const json: ApiResponse<HomeHeroConfig> = await res.json();
    if (!res.ok || !json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchVisionPageCms(): Promise<VisionPageCms | null> {
  try {
    const res = await fetch(`${CMS_BASE}/vision`);
    const json: ApiResponse<VisionPageCms> = await res.json();
    if (!res.ok || !json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchSiteChrome(): Promise<SiteChromeCms | null> {
  try {
    const res = await fetch(`${CMS_BASE}/site-chrome`);
    const json: ApiResponse<SiteChromeCms> = await res.json();
    if (!res.ok || !json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchWallPageCms(): Promise<WallPageCms | null> {
  try {
    const res = await fetch(`${CMS_BASE}/wall`);
    const json: ApiResponse<WallPageCms> = await res.json();
    if (!res.ok || !json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

const ADMIN_TOKEN_KEY = "leadership_cms_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function saveHomeHeroCms(
  form: FormData
): Promise<{ ok: boolean; message: string; data?: HomeHeroConfig }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}/cms/home-hero`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const json: ApiResponse<HomeHeroConfig> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as HomeHeroConfig,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "Saved" : "Save failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export async function saveVisionPageCms(
  form: FormData
): Promise<{ ok: boolean; message: string; data?: VisionPageCms }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}/cms/vision`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const json: ApiResponse<VisionPageCms> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as VisionPageCms,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "Saved" : "Save failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export async function saveSiteChromeCms(
  form: FormData
): Promise<{ ok: boolean; message: string; data?: SiteChromeCms }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}/cms/site-chrome`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const json: ApiResponse<SiteChromeCms> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as SiteChromeCms,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "Saved" : "Save failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export interface WallAdminActivityRow {
  id: number;
  name: string;
  role: string;
  author_email: string | null;
  bodyPreview: string;
  post_type: string;
  tag: string;
  word: string;
  likes: number;
  comments_count: number;
  created_at: string;
  poll_options: { label: string; votes: number }[];
}

export async function fetchWallAdminActivity(limit = 50): Promise<WallAdminActivityRow[]> {
  const token = getAdminToken();
  if (!token) return [];
  try {
    const res = await fetch(`${ADMIN_BASE}/wall/activity?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json: ApiResponse<{ posts: WallAdminActivityRow[] }> = await res.json().catch(() => ({
      success: false,
      message: "",
      data: { posts: [] },
    }));
    if (!res.ok || !json.success || !json.data?.posts) return [];
    return json.data.posts;
  } catch {
    return [];
  }
}

export async function saveWallPageCms(
  form: FormData
): Promise<{ ok: boolean; message: string; data?: WallPageCms }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}/cms/wall`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const json: ApiResponse<WallPageCms> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as WallPageCms,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "Saved" : "Save failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export async function authLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) {
      return { ok: false, message: json.message || "Login failed" };
    }
    setAdminToken(json.token);
    return { ok: true, token: json.token };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export function adminLogout(): void {
  setAdminToken(null);
}
