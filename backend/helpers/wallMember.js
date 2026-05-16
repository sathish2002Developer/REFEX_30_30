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

function mapWallMember(member) {
  return {
    id: member.id,
    name: member.name,
    designation: member.designation,
    teamEntity: member.team_entity,
    email: member.email,
    role: memberRole(member),
    initials: initialsFromName(member.name),
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

module.exports = {
  initialsFromName,
  memberRole,
  mapWallMember,
  normalizeEmail,
};
