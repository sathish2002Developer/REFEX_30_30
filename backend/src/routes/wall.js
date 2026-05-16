import { Router } from "express";
import pool from "../config/db.js";
import { uploadImage } from "../middleware/upload.js";

const router = Router();

function initialsFromName(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "YO";
}

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function mapPost(row, pollOptions = []) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    word: row.word,
    body: row.body,
    tag: row.tag,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    time: formatTimeAgo(row.created_at),
    hasSketch: Boolean(row.has_sketch),
    postType: row.post_type,
    imageUrl: row.image_url || undefined,
    sketchUrl: row.sketch_url || undefined,
    isPinned: Boolean(row.is_pinned),
    isBookmarked: Boolean(row.is_bookmarked),
    pollOptions:
      pollOptions.length > 0
        ? pollOptions.map((o) => ({
            id: o.id,
            label: o.label,
            shortLabel: o.short_label,
            votes: o.votes,
          }))
        : undefined,
  };
}

async function fetchPollOptions(postIds) {
  if (postIds.length === 0) return {};
  const placeholders = postIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT * FROM wall_poll_options WHERE post_id IN (${placeholders}) ORDER BY sort_order ASC`,
    postIds
  );
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.post_id]) grouped[row.post_id] = [];
    grouped[row.post_id].push(row);
  }
  return grouped;
}

router.get("/posts", async (_req, res) => {
  try { 
    const [posts] = await pool.query(
      `SELECT * FROM wall_posts ORDER BY is_pinned DESC, created_at DESC LIMIT 100`
    );
    const pollMap = await fetchPollOptions(posts.map((p) => p.id));
    res.json(posts.map((p) => mapPost(p, pollMap[p.id] || [])));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

router.post("/posts", uploadImage.fields([
  { name: "image", maxCount: 1 },
  { name: "sketch", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      text = "",
      word = "",
      tag = "General",
      tab = "post",
      hasSketch = "false",
      name = "You",
      role = "Leader",
      pollOptions,
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const sketchFile = req.files?.sketch?.[0];
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let postType = "text";
    if (tab === "poll") postType = "poll";
    else if (hasSketch === "true" || sketchFile) postType = "sketch";
    else if (imageFile) postType = "image";

    const body =
      text?.trim() ||
      (postType === "sketch" ? "[Sketch shared]" : postType === "image" ? "Shared an image" : "New post");

    const imageUrl = imageFile ? `${baseUrl}/uploads/${imageFile.filename}` : null;
    const sketchUrl = sketchFile ? `${baseUrl}/uploads/${sketchFile.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO wall_posts
        (name, role, initials, word, body, tag, post_type, image_url, sketch_url, has_sketch)
       VALUES
        (:name, :role, :initials, :word, :body, :tag, :post_type, :image_url, :sketch_url, :has_sketch)`,
      {
        name,
        role,
        initials: initialsFromName(name),
        word: word || tag,
        body,
        tag,
        post_type: postType,
        image_url: imageUrl,
        sketch_url: sketchUrl,
        has_sketch: hasSketch === "true" || Boolean(sketchFile) ? 1 : 0,
      }
    );

    const postId = result.insertId;
    let parsedPoll = [];
    if (pollOptions) {
      try {
        parsedPoll = typeof pollOptions === "string" ? JSON.parse(pollOptions) : pollOptions;
      } catch {
        parsedPoll = [];
      }
    }

    if (postType === "poll" && Array.isArray(parsedPoll) && parsedPoll.length > 0) {
      for (let i = 0; i < parsedPoll.length; i++) {
        const opt = parsedPoll[i];
        await pool.query(
          `INSERT INTO wall_poll_options (post_id, label, short_label, votes, sort_order)
           VALUES (:post_id, :label, :short_label, 0, :sort_order)`,
          {
            post_id: postId,
            label: opt.label || opt.shortLabel || `Option ${i + 1}`,
            short_label: opt.shortLabel || opt.label || `Option ${i + 1}`,
            sort_order: i,
          }
        );
      }
    }

    const [[post]] = await pool.query(`SELECT * FROM wall_posts WHERE id = ?`, [postId]);
    const pollMap = await fetchPollOptions([postId]);
    res.status(201).json(mapPost(post, pollMap[postId] || []));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to create post" });
  }
});

router.patch("/posts/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE wall_posts SET likes = likes + 1 WHERE id = ?`, [id]);
    const [[post]] = await pool.query(`SELECT likes FROM wall_posts WHERE id = ?`, [id]);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

router.patch("/posts/:id/bookmark", async (req, res) => {
  try {
    const { id } = req.params;
    const [[current]] = await pool.query(`SELECT is_bookmarked FROM wall_posts WHERE id = ?`, [id]);
    if (!current) return res.status(404).json({ error: "Post not found" });
    const next = current.is_bookmarked ? 0 : 1;
    await pool.query(`UPDATE wall_posts SET is_bookmarked = ? WHERE id = ?`, [next, id]);
    res.json({ isBookmarked: Boolean(next) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bookmark post" });
  }
});

router.post("/posts/:id/poll-vote", async (req, res) => {
  try {
    const { optionId } = req.body;
    const { id } = req.params;
    await pool.query(
      `UPDATE wall_poll_options SET votes = votes + 1 WHERE id = ? AND post_id = ?`,
      [optionId, id]
    );
    const [options] = await pool.query(
      `SELECT * FROM wall_poll_options WHERE post_id = ? ORDER BY sort_order ASC`,
      [id]
    );
    res.json(
      options.map((o) => ({
        id: o.id,
        label: o.label,
        shortLabel: o.short_label,
        votes: o.votes,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to vote" });
  }
});

export default router;
