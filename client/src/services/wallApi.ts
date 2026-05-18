import type { WallEntry, WallLiker } from "../mocks/wallData";
import { wallAuthHeaders } from "./wallAuth";

const API_BASE = import.meta.env.VITE_API_URL || "/api/wall";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const auth = wallAuthHeaders();
  if (auth.Authorization) headers.set("Authorization", auth.Authorization);
  const res = await fetch(url, { ...options, headers });
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: "Invalid response",
    data: null as T,
  }));
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data;
}

export interface CreatePostPayload {
  text: string;
  word: string;
  tag: string;
  tab: string;
  hasSketch: boolean;
  name?: string;
  role?: string;
  pollOptions?: { label: string; shortLabel: string; votes: number }[];
  imageFile?: File | null;
  sketchBlob?: Blob | null;
}

export interface WallComment {
  id: number;
  name: string;
  role: string;
  initials: string;
  body: string;
  time: string;
  avatarUrl?: string;
  avatar_url?: string | null;
}

export async function fetchWallPosts(params?: {
  tag?: string;
  bookmarked?: boolean;
  limit?: number;
  offset?: number;
}): Promise<WallEntry[]> {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.bookmarked) qs.set("bookmarked", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const query = qs.toString();
  const data = await request<{ posts: WallEntry[] }>(
    `${API_BASE}/posts${query ? `?${query}` : ""}`
  );
  return data.posts;
}

export async function fetchWallPost(id: number): Promise<WallEntry> {
  const data = await request<{ post: WallEntry }>(`${API_BASE}/posts/${id}`);
  return data.post;
}

export async function createWallPost(payload: CreatePostPayload): Promise<WallEntry> {
  const form = new FormData();
  form.append("text", payload.text);
  form.append("word", payload.word);
  form.append("tag", payload.tag);
  form.append("tab", payload.tab);
  form.append("hasSketch", String(payload.hasSketch));
  if (payload.pollOptions) {
    form.append("pollOptions", JSON.stringify(payload.pollOptions));
  }
  if (payload.imageFile) {
    form.append("image", payload.imageFile);
  }
  if (payload.sketchBlob) {
    form.append("sketch", payload.sketchBlob, "sketch.png");
  }

  const data = await request<{ post: WallEntry }>(`${API_BASE}/posts`, {
    method: "POST",
    body: form,
  });
  return data.post;
}

export interface LikePostResult {
  likes: number;
  likers: WallLiker[];
  likedByMe: boolean;
}

export async function likeWallPost(id: number): Promise<LikePostResult> {
  return request(`${API_BASE}/posts/${id}/like`, { method: "PATCH" });
}

export async function bookmarkWallPost(id: number): Promise<boolean> {
  const data = await request<{ isBookmarked: boolean }>(
    `${API_BASE}/posts/${id}/bookmark`,
    { method: "PATCH" }
  );
  return data.isBookmarked;
}

export async function shareWallPost(id: number): Promise<number> {
  const data = await request<{ shares: number }>(`${API_BASE}/posts/${id}/share`, {
    method: "PATCH",
  });
  return data.shares;
}

export interface ReactPostResult {
  likes: number;
  likers: WallLiker[];
  reactions: WallEntry["reactions"];
  myReactionEmoji: string | null;
}

export async function reactToWallPost(id: number, emoji: string): Promise<ReactPostResult> {
  return request(`${API_BASE}/posts/${id}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emoji }),
  });
}

export interface VotePollResult {
  pollOptions: NonNullable<WallEntry["pollOptions"]>;
  pollVotedOptionId: number | null;
}

export async function votePollOption(postId: number, optionId: number): Promise<VotePollResult> {
  return request(`${API_BASE}/posts/${postId}/poll-vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId }),
  });
}

export async function fetchWallComments(postId: number): Promise<WallComment[]> {
  const data = await request<{ comments: WallComment[] }>(
    `${API_BASE}/posts/${postId}/comments`
  );
  return data.comments;
}

/** No Authorization header — usable from admin CMS without wall session */
async function getPublicWallPayload<T>(
  path: string
): Promise<{ ok: boolean; data: T | undefined }> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const json = (await res.json()) as ApiResponse<T>;
    const ok = res.ok && Boolean(json.success) && json.data !== undefined && json.data !== null;
    return { ok, data: ok ? json.data : undefined };
  } catch {
    return { ok: false, data: undefined };
  }
}

export async function fetchWallPostLikersPublic(
  postId: number
): Promise<{ likers: WallLiker[]; likes: number }> {
  const { ok, data } = await getPublicWallPayload<{ likers: WallLiker[]; likes: number }>(
    `/posts/${postId}/likes`
  );
  if (!ok || !data)
    return { likers: [], likes: 0 };
  const likers = Array.isArray(data.likers) ? data.likers : [];
  const likes =
    typeof data.likes === "number" && Number.isFinite(data.likes)
      ? data.likes
      : likers.length;
  return { likers, likes };
}

export async function fetchWallPostCommentsPublic(postId: number): Promise<WallComment[]> {
  const { ok, data } = await getPublicWallPayload<{ comments: WallComment[] }>(
    `/posts/${postId}/comments`
  );
  if (!ok || !data?.comments) return [];
  return data.comments;
}

export interface WallTrendingWordStat {
  word: string;
  count: number;
}

/** Public — aggregates `word` from wall posts (`GET /stats`). */
export async function fetchWallStats(): Promise<{
  wordCloud: WallTrendingWordStat[];
  totalPosts?: number;
} | null> {
  const { ok, data } = await getPublicWallPayload<{
    wordCloud: WallTrendingWordStat[];
    totalPosts: number;
  }>("/stats");
  if (!ok || !data) return null;
  return {
    wordCloud: Array.isArray(data.wordCloud) ? data.wordCloud : [],
    totalPosts: typeof data.totalPosts === "number" ? data.totalPosts : undefined,
  };
}

export async function addWallComment(
  postId: number,
  body: string,
  name = "You",
  role = "Leader"
): Promise<{ comment: WallComment; comments: number }> {
  return request(`${API_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, name, role }),
  });
}

export async function deleteWallPost(id: number): Promise<void> {
  await request(`${API_BASE}/posts/${id}`, { method: "DELETE" });
}
