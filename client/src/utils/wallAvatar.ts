import { wallMediaUrl } from "./wallMediaUrl";

export type WallAvatarSource =
  | string
  | null
  | undefined
  | { avatarUrl?: string | null; avatar_url?: string | null };

/** Resolved same-origin URL for a wall member or comment avatar (or undefined). */
export function getWallAvatarUrl(source: WallAvatarSource): string | undefined {
  if (source == null) return undefined;
  const raw =
    typeof source === "string"
      ? source
      : source.avatarUrl ?? source.avatar_url ?? null;
  if (!raw || !String(raw).trim()) return undefined;
  return wallMediaUrl(raw);
}

/** Avatar for a comment row, with fallback to the signed-in user when names match. */
export function resolveCommentAvatar(
  comment: { avatarUrl?: string | null; avatar_url?: string | null; name?: string },
  currentUser?: { avatarUrl?: string | null; avatar_url?: string | null; name?: string } | null
): string | undefined {
  const fromComment = getWallAvatarUrl(comment);
  if (fromComment) return fromComment;

  if (!currentUser?.name || !comment.name) return undefined;
  if (currentUser.name.trim().toLowerCase() !== comment.name.trim().toLowerCase()) {
    return undefined;
  }
  return getWallAvatarUrl(currentUser);
}
