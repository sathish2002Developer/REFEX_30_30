import type { HomeHeroConfig } from "../types/homeHeroCms";
import type { VisionPageCms } from "../types/visionCms";
import type { SiteChromeCms } from "../types/siteChromeCms";
import type { WallPageCms } from "../types/wallPageCms";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const CMS_BASE = "https://30by30.refex.group/api/cms";
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

export type CmsResourceType = "home-hero" | "vision" | "site-chrome" | "wall";

export interface CmsRevisionRow {
  id: number;
  resource_type: CmsResourceType;
  version_number: number;
  label: string;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
}

async function adminGetJson<T>(path: string): Promise<{ ok: boolean; data?: T; message: string }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as T,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || "",
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export interface CmsRevisionsList {
  revisions: CmsRevisionRow[];
  latest_version_number: number;
}

export async function fetchCmsRevisions(
  resource: CmsResourceType,
  limit = 50
): Promise<CmsRevisionsList> {
  const r = await adminGetJson<{
    revisions: CmsRevisionRow[];
    latest_version_number?: number;
  }>(`/cms/${encodeURIComponent(resource)}/revisions?limit=${limit}`);
  if (!r.ok) {
    console.warn("[fetchCmsRevisions]", resource, r.message);
    return { revisions: [], latest_version_number: 0 };
  }
  const list = r.data?.revisions;
  const revisions = Array.isArray(list) ? list : [];
  const latest_version_number =
    typeof r.data?.latest_version_number === "number"
      ? r.data.latest_version_number
      : revisions[0]?.version_number ?? 0;
  return { revisions, latest_version_number };
}

export async function revertCmsRevision<T = unknown>(
  resource: CmsResourceType,
  revisionId: number
): Promise<{ ok: boolean; message: string; data?: T }> {
  return adminJsonRequest<T>(`/cms/${resource}/revisions/${revisionId}/revert`, {
    method: "POST",
  });
}

export interface RevisionChangeRow {
  field: string;
  from: string;
  to: string;
}

export interface RevisionChangesDetail {
  revision: {
    id: number;
    version_number: number;
    label: string;
    created_at: string;
  };
  changes: RevisionChangeRow[];
  summary: string;
}

export async function fetchCmsRevisionChanges(
  resource: CmsResourceType,
  revisionId: number
): Promise<RevisionChangesDetail | null> {
  const r = await adminGetJson<RevisionChangesDetail>(
    `/cms/${encodeURIComponent(resource)}/revisions/${revisionId}/changes`
  );
  if (!r.ok || !r.data) return null;
  return r.data;
}

export interface WallMemberAdminRow {
  id: number;
  name: string;
  designation: string;
  teamEntity: string;
  team_entity: string;
  email: string;
  role: string;
  initials: string;
  is_active: boolean;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  avatar_resolved_url?: string | null;
  initialPassword?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WallMemberFormInput {
  name: string;
  email: string;
  designation?: string;
  teamEntity?: string;
  isActive?: boolean;
  removeAvatar?: boolean;
}

async function adminJsonRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; message: string; data?: T }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as T,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "OK" : "Request failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export async function fetchWallMembersAdmin(
  q = "",
  activeOnly = false
): Promise<WallMemberAdminRow[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (activeOnly) params.set("active", "true");
  const qs = params.toString();
  const r = await adminJsonRequest<WallMemberAdminRow[]>(
    `/wall-members${qs ? `?${qs}` : ""}`
  );
  if (!r.ok || !Array.isArray(r.data)) return [];
  return r.data;
}

async function adminFormRequest<T>(
  path: string,
  form: FormData,
  method: "POST" | "PATCH"
): Promise<{ ok: boolean; message: string; data?: T }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, message: "Not signed in" };
  }
  try {
    const res = await fetch(`${ADMIN_BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      message: "Invalid response",
      data: null as unknown as T,
    }));
    return {
      ok: res.ok && json.success,
      message: json.message || (res.ok ? "OK" : "Request failed"),
      data: json.data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

function appendWallMemberFields(form: FormData, input: WallMemberFormInput) {
  form.append("name", input.name.trim());
  form.append("email", input.email.trim());
  form.append("designation", input.designation?.trim() ?? "");
  form.append("teamEntity", input.teamEntity?.trim() ?? "");
  form.append("isActive", String(input.isActive ?? true));
  if (input.removeAvatar) form.append("removeAvatar", "true");
}

export async function createWallMemberAdmin(
  input: WallMemberFormInput,
  avatarFile?: File | null
): Promise<{ ok: boolean; message: string; data?: WallMemberAdminRow }> {
  const form = new FormData();
  appendWallMemberFields(form, input);
  if (avatarFile) form.append("avatar", avatarFile);
  return adminFormRequest<WallMemberAdminRow>("/wall-members", form, "POST");
}

export interface WallMemberRevisionRow {
  id: number;
  wall_member_id: number;
  version_number: number;
  label: string;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
}

export interface WallMemberRevisionsList {
  revisions: WallMemberRevisionRow[];
  latest_version_number: number;
}

export async function fetchWallMemberRevisions(
  memberId: number,
  limit = 50
): Promise<WallMemberRevisionsList> {
  const r = await adminGetJson<{
    revisions: WallMemberRevisionRow[];
    latest_version_number?: number;
  }>(`/wall-members/${memberId}/revisions?limit=${limit}`);
  if (!r.ok) {
    console.warn("[fetchWallMemberRevisions]", memberId, r.message);
    return { revisions: [], latest_version_number: 0 };
  }
  const list = r.data?.revisions;
  const revisions = Array.isArray(list) ? list : [];
  const latest_version_number =
    typeof r.data?.latest_version_number === "number"
      ? r.data.latest_version_number
      : revisions[0]?.version_number ?? 0;
  return { revisions, latest_version_number };
}

export async function revertWallMemberRevision(
  memberId: number,
  revisionId: number
): Promise<{ ok: boolean; message: string; data?: WallMemberAdminRow }> {
  return adminJsonRequest<WallMemberAdminRow>(
    `/wall-members/${memberId}/revisions/${revisionId}/revert`,
    { method: "POST" }
  );
}

export async function fetchWallMemberRevisionChanges(
  memberId: number,
  revisionId: number
): Promise<RevisionChangesDetail | null> {
  const r = await adminGetJson<RevisionChangesDetail>(
    `/wall-members/${memberId}/revisions/${revisionId}/changes`
  );
  if (!r.ok || !r.data) return null;
  return r.data;
}

export async function updateWallMemberAdmin(
  id: number,
  input: Partial<WallMemberFormInput> & { resetPassword?: boolean },
  avatarFile?: File | null
): Promise<{ ok: boolean; message: string; data?: WallMemberAdminRow }> {
  const form = new FormData();
  if (input.name !== undefined) form.append("name", input.name.trim());
  if (input.email !== undefined) form.append("email", input.email.trim());
  if (input.designation !== undefined) form.append("designation", input.designation.trim());
  if (input.teamEntity !== undefined) form.append("teamEntity", input.teamEntity.trim());
  if (input.isActive !== undefined) form.append("isActive", String(input.isActive));
  if (input.removeAvatar) form.append("removeAvatar", "true");
  if (input.resetPassword) form.append("resetPassword", "true");
  if (avatarFile) form.append("avatar", avatarFile);
  return adminFormRequest<WallMemberAdminRow>(`/wall-members/${id}`, form, "PATCH");
}
