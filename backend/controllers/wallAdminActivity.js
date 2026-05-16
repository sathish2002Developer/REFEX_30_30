const { WallPost, WallPollOption } = require("../models");
const { responseStatus } = require("../helpers/response");

function truncateBody(s, len) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= len) return t;
  return `${t.slice(0, len - 1)}…`;
}

async function listWallActivity(req, res) {
  try {
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 40, 1), 100);

    const posts = await WallPost.findAll({
      attributes: [
        "id",
        "name",
        "role",
        "author_email",
        "body",
        "post_type",
        "tag",
        "word",
        "likes",
        "comments_count",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      limit,
      include: [
        {
          model: WallPollOption,
          as: "pollOptions",
          attributes: ["id", "label", "votes", "sort_order"],
          separate: true,
          order: [["sort_order", "ASC"]],
        },
      ],
    });

    const data = posts.map((p) => {
      const j = p.toJSON();
      const opts = Array.isArray(j.pollOptions)
        ? j.pollOptions.map((o) => ({ label: o.label, votes: o.votes }))
        : [];
      return {
        id: j.id,
        name: j.name,
        role: j.role,
        author_email: j.author_email,
        bodyPreview: truncateBody(j.body, 140),
        post_type: j.post_type,
        tag: j.tag,
        word: j.word,
        likes: j.likes,
        comments_count: j.comments_count,
        created_at: j.created_at,
        poll_options: opts,
      };
    });

    return responseStatus(res, 200, "Wall activity", { posts: data });
  } catch (err) {
    console.error("listWallActivity:", err);
    return responseStatus(res, 500, "Failed to load wall activity");
  }
}

module.exports = { listWallActivity };
