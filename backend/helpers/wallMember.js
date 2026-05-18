function initialsFromName(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "YO"
  );
}

function memberRole(member) {
  const parts = [member.designation, member.team_entity].filter(Boolean);
  return parts.join(" · ") || "Refex Leader";
}

function memberAvatarPath(member) {
  const raw = member.avatar_url;
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function resolveMemberAvatar(_req, avatarUrl) {
  const stored = avatarUrl && String(avatarUrl).trim();
  if (!stored) return null;
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    try {
      const u = new URL(stored);
      if (u.pathname.startsWith("/uploads/")) {
        return `${u.pathname}${u.search}`;
      }
    } catch {
      return stored;
    }
    return stored;
  }
  return stored.startsWith("/") ? stored : `/${stored}`;
}

function mapWallMember(member, req = null) {
  const avatar_url = memberAvatarPath(member);
  return {
    id: member.id,
    name: member.name,
    designation: member.designation,
    teamEntity: member.team_entity,
    email: member.email,
    role: memberRole(member),
    initials: initialsFromName(member.name),
    avatar_url,
    avatarUrl: resolveMemberAvatar(req, avatar_url),
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

module.exports = {
  initialsFromName,
  memberRole,
  memberAvatarPath,
  resolveMemberAvatar,
  mapWallMember,
  normalizeEmail,
};
