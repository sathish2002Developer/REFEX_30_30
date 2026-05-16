const {
  WallPost,
  WallPollOption,
  WallComment,
  WallReaction,
  WallLike,
  WallPollVote,
  sequelize,
} = require("../models");
const { responseStatus } = require("../helpers/response");
const { initialsFromName } = require("../helpers/wallMember");

function authorFromRequest(req) {
  const u = req.wallUser;
  if (!u) return null;
  return {
    wall_member_id: u.id,
    author_email: u.email,
    name: u.name,
    role: u.role,
    initials: u.initials,
  };
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

function mapParticipant(row) {
  return {
    id: row.id,
    wallMemberId: row.wall_member_id,
    name: row.name,
    role: row.role,
    initials: row.initials,
  };
}

function aggregateReactions(reactionsList = []) {
  const map = {};
  for (const r of reactionsList) {
    const participant = mapParticipant(r);
    if (!map[r.emoji]) {
      map[r.emoji] = { emoji: r.emoji, count: 0, voters: [], users: [] };
    }
    map[r.emoji].count += 1;
    map[r.emoji].voters.push(participant);
    if (r.initials && !map[r.emoji].users.includes(r.initials)) {
      map[r.emoji].users.push(r.initials);
    }
  }
  return Object.values(map);
}

function mapComment(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    body: row.body,
    time: formatTimeAgo(row.created_at),
  };
}

const mapLiker = mapParticipant;

async function fetchLikersForPost(postId) {
  const rows = await WallLike.findAll({
    where: { post_id: postId },
    order: [["created_at", "DESC"]],
  });
  return rows.map(mapLiker);
}

async function fetchPollOptionsForPost(postId) {
  return WallPollOption.findAll({
    where: { post_id: postId },
    order: [["sort_order", "ASC"]],
    include: [{ model: WallPollVote, as: "votesList" }],
  });
}

function mapPollOptionsRows(options) {
  return options.map((o) => {
    const voters = (o.votesList || []).map(mapParticipant);
    return {
      id: o.id,
      label: o.label,
      shortLabel: o.short_label,
      votes: voters.length > 0 ? voters.length : o.votes,
      voters: voters.length > 0 ? voters : undefined,
    };
  });
}

async function buildPostMeta(postIds, userId) {
  const meta = {};
  for (const id of postIds) {
    meta[id] = { pollVotedOptionId: null, myReactionEmoji: null };
  }
  if (!userId || postIds.length === 0) return meta;

  const pollVotes = await WallPollVote.findAll({
    where: { post_id: postIds, wall_member_id: userId },
  });
  const reactions = await WallReaction.findAll({
    where: { post_id: postIds, wall_member_id: userId },
  });

  for (const v of pollVotes) {
    if (meta[v.post_id]) meta[v.post_id].pollVotedOptionId = v.poll_option_id;
  }
  for (const r of reactions) {
    if (meta[r.post_id]) meta[r.post_id].myReactionEmoji = r.emoji;
  }
  return meta;
}

function mapPost(post, options = {}) {
  const row = post.toJSON ? post.toJSON() : post;
  const pollOptions = row.pollOptions || [];
  const reactionsList = row.reactionsList || [];
  const commentsList = row.commentsList || [];
  const likesList = row.likesList || [];
  const likers = likesList.map(mapLiker);
  const currentUserId = options.currentUserId;

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    word: row.word,
    body: row.body,
    tag: row.tag,
    likes: likers.length > 0 ? likers.length : row.likes,
    likers: likers.length > 0 ? likers : undefined,
    likedByMe: currentUserId
      ? likers.some((l) => l.wallMemberId === currentUserId)
      : false,
    comments: row.comments_count,
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
        ? pollOptions
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((o) => {
              const voters = (o.votesList || []).map(mapParticipant);
              return {
                id: o.id,
                label: o.label,
                shortLabel: o.short_label,
                votes: voters.length > 0 ? voters.length : o.votes,
                voters: voters.length > 0 ? voters : undefined,
              };
            })
        : undefined,
    pollVotedOptionId: options.pollVotedOptionId ?? undefined,
    myReactionEmoji: options.myReactionEmoji ?? undefined,
    reactions:
      reactionsList.length > 0 ? aggregateReactions(reactionsList) : undefined,
    commentItems:
      options.includeComments && commentsList.length > 0
        ? commentsList.map(mapComment)
        : undefined,
  };
}

function fileUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/wall/${filename}`;
}

const pollOptionsInclude = {
  model: WallPollOption,
  as: "pollOptions",
  separate: true,
  include: [
    {
      model: WallPollVote,
      as: "votesList",
      separate: true,
    },
  ],
};

const postIncludes = [
  pollOptionsInclude,
  { model: WallReaction, as: "reactionsList", separate: true },
  {
    model: WallLike,
    as: "likesList",
    separate: true,
    order: [["created_at", "DESC"]],
  },
];

function currentUserIdFromReq(req) {
  return req.wallUser?.id ?? null;
}

async function findPostById(id, extraIncludes = []) {
  return WallPost.findByPk(id, {
    include: [...postIncludes, ...extraIncludes],
  });
}

const listPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const tag = req.query.tag;
    const bookmarked = req.query.bookmarked === "true";

    const where = {};
    if (tag) where.tag = tag;
    if (bookmarked) where.is_bookmarked = true;

    const { rows, count } = await WallPost.findAndCountAll({
      where,
      include: postIncludes,
      order: [
        ["is_pinned", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
      offset,
    });

    const userId = currentUserIdFromReq(req);
    const meta = await buildPostMeta(
      rows.map((p) => p.id),
      userId
    );
    return responseStatus(res, 200, "Posts loaded", {
      posts: rows.map((p) =>
        mapPost(p, {
          currentUserId: userId,
          pollVotedOptionId: meta[p.id]?.pollVotedOptionId,
          myReactionEmoji: meta[p.id]?.myReactionEmoji,
        })
      ),
      total: count,
      limit,
      offset,
    });
  } catch (err) {
    console.error("listPosts:", err);
    return responseStatus(res, 500, "Failed to load posts");
  }
};

const getPost = async (req, res) => {
  try {
    const post = await findPostById(req.params.id, [
      {
        model: WallComment,
        as: "commentsList",
        separate: true,
        order: [["created_at", "ASC"]],
      },
    ]);
    if (!post) return responseStatus(res, 404, "Post not found");
    const userId = currentUserIdFromReq(req);
    const meta = await buildPostMeta([post.id], userId);
    return responseStatus(res, 200, "Post loaded", {
      post: mapPost(post, {
        includeComments: true,
        currentUserId: userId,
        pollVotedOptionId: meta[post.id]?.pollVotedOptionId,
        myReactionEmoji: meta[post.id]?.myReactionEmoji,
      }),
    });
  } catch (err) {
    console.error("getPost:", err);
    return responseStatus(res, 500, "Failed to load post");
  }
};

const createPost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const author = authorFromRequest(req);
    if (!author) {
      return responseStatus(res, 401, "Please sign in to create a post");
    }

    const {
      text = "",
      word = "",
      tag = "General",
      tab = "post",
      hasSketch = "false",
      pollOptions,
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const sketchFile = req.files?.sketch?.[0];

    let postType = "text";
    if (tab === "poll") postType = "poll";
    else if (hasSketch === "true" || sketchFile) postType = "sketch";
    else if (imageFile) postType = "image";

    const body =
      String(text).trim() ||
      (postType === "sketch"
        ? "[Sketch shared]"
        : postType === "image"
          ? "Shared an image"
          : "New post");

    const post = await WallPost.create(
      {
        wall_member_id: author.wall_member_id,
        author_email: author.author_email,
        name: author.name,
        role: author.role,
        initials: author.initials,
        word: word || tag,
        body,
        tag,
        post_type: postType,
        image_url: imageFile ? fileUrl(req, imageFile.filename) : null,
        sketch_url: sketchFile ? fileUrl(req, sketchFile.filename) : null,
        has_sketch: hasSketch === "true" || Boolean(sketchFile),
      },
      { transaction }
    );

    let parsedPoll = [];
    if (pollOptions) {
      try {
        parsedPoll =
          typeof pollOptions === "string" ? JSON.parse(pollOptions) : pollOptions;
      } catch {
        parsedPoll = [];
      }
    }

    if (postType === "poll" && Array.isArray(parsedPoll) && parsedPoll.length > 0) {
      await WallPollOption.bulkCreate(
        parsedPoll.map((opt, i) => ({
          post_id: post.id,
          label: opt.label || opt.shortLabel || `Option ${i + 1}`,
          short_label: opt.shortLabel || opt.label || `Option ${i + 1}`,
          votes: 0,
          sort_order: i,
        })),
        { transaction }
      );
    }

    await transaction.commit();
    const full = await findPostById(post.id);
    return responseStatus(res, 201, "Post created", { post: mapPost(full) });
  } catch (err) {
    await transaction.rollback();
    console.error("createPost:", err);
    return responseStatus(res, 500, err.message || "Failed to create post");
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");

    const { body, word, tag, isPinned } = req.body;
    if (body !== undefined) post.body = body;
    if (word !== undefined) post.word = word;
    if (tag !== undefined) post.tag = tag;
    if (isPinned !== undefined) post.is_pinned = Boolean(isPinned);
    await post.save();

    const full = await findPostById(post.id);
    return responseStatus(res, 200, "Post updated", { post: mapPost(full) });
  } catch (err) {
    console.error("updatePost:", err);
    return responseStatus(res, 500, "Failed to update post");
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");
    await post.destroy();
    return responseStatus(res, 200, "Post deleted");
  } catch (err) {
    console.error("deletePost:", err);
    return responseStatus(res, 500, "Failed to delete post");
  }
};

const likePost = async (req, res) => {
  try {
    const author = authorFromRequest(req);
    if (!author) return responseStatus(res, 401, "Please sign in to like");

    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");

    const existing = await WallLike.findOne({
      where: { post_id: post.id, wall_member_id: author.wall_member_id },
    });

    let likedByMe;
    if (existing) {
      await existing.destroy();
      post.likes = Math.max(0, post.likes - 1);
      likedByMe = false;
    } else {
      await WallLike.create({
        post_id: post.id,
        wall_member_id: author.wall_member_id,
        name: author.name,
        role: author.role,
        initials: author.initials,
      });
      post.likes += 1;
      likedByMe = true;
    }
    await post.save();

    const likers = await fetchLikersForPost(post.id);
    return responseStatus(res, 200, likedByMe ? "Post liked" : "Like removed", {
      likes: likers.length,
      likers,
      likedByMe,
    });
  } catch (err) {
    console.error("likePost:", err);
    return responseStatus(res, 500, "Failed to like post");
  }
};

const listLikers = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");
    const likers = await fetchLikersForPost(post.id);
    return responseStatus(res, 200, "Likers loaded", { likers, likes: likers.length });
  } catch (err) {
    console.error("listLikers:", err);
    return responseStatus(res, 500, "Failed to load likers");
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");
    post.is_bookmarked = !post.is_bookmarked;
    await post.save();
    return responseStatus(res, 200, "Bookmark updated", {
      isBookmarked: post.is_bookmarked,
    });
  } catch (err) {
    console.error("bookmarkPost:", err);
    return responseStatus(res, 500, "Failed to bookmark post");
  }
};

const sharePost = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");
    post.shares += 1;
    await post.save();
    return responseStatus(res, 200, "Share counted", { shares: post.shares });
  } catch (err) {
    console.error("sharePost:", err);
    return responseStatus(res, 500, "Failed to share post");
  }
};

const savePost = async (req, res) => {
  try {
    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");
    post.saves += 1;
    await post.save();
    return responseStatus(res, 200, "Save counted", { saves: post.saves });
  } catch (err) {
    console.error("savePost:", err);
    return responseStatus(res, 500, "Failed to save post");
  }
};

const votePoll = async (req, res) => {
  try {
    const author = authorFromRequest(req);
    if (!author) return responseStatus(res, 401, "Please sign in to vote");

    const { optionId } = req.body;
    const postId = req.params.id;
    const option = await WallPollOption.findOne({
      where: { id: optionId, post_id: postId },
    });
    if (!option) return responseStatus(res, 404, "Poll option not found");

    const existing = await WallPollVote.findOne({
      where: { post_id: postId, wall_member_id: author.wall_member_id },
    });

    if (existing) {
      const options = await fetchPollOptionsForPost(postId);
      return responseStatus(res, 200, "Already voted", {
        pollOptions: mapPollOptionsRows(options),
        pollVotedOptionId: existing.poll_option_id,
      });
    }

    await WallPollVote.create({
      post_id: postId,
      poll_option_id: optionId,
      wall_member_id: author.wall_member_id,
      name: author.name,
      role: author.role,
      initials: author.initials,
    });
    option.votes += 1;
    await option.save();

    const options = await fetchPollOptionsForPost(postId);
    return responseStatus(res, 200, "Vote recorded", {
      pollOptions: mapPollOptionsRows(options),
      pollVotedOptionId: Number(optionId),
    });
  } catch (err) {
    console.error("votePoll:", err);
    return responseStatus(res, 500, "Failed to vote");
  }
};

const addReaction = async (req, res) => {
  try {
    const author = authorFromRequest(req);
    if (!author) return responseStatus(res, 401, "Please sign in to react");

    const { emoji } = req.body;
    if (!emoji) return responseStatus(res, 400, "Emoji is required");

    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");

    const existing = await WallReaction.findOne({
      where: { post_id: post.id, wall_member_id: author.wall_member_id },
    });

    let myReactionEmoji = null;
    if (existing) {
      if (existing.emoji === emoji) {
        await existing.destroy();
      } else {
        await existing.update({
          emoji,
          name: author.name,
          role: author.role,
          initials: author.initials,
        });
        myReactionEmoji = emoji;
      }
    } else {
      await WallReaction.create({
        post_id: post.id,
        wall_member_id: author.wall_member_id,
        emoji,
        name: author.name,
        role: author.role,
        initials: author.initials,
      });
      myReactionEmoji = emoji;
    }

    const reactions = await WallReaction.findAll({
      where: { post_id: post.id },
    });
    const likers = await fetchLikersForPost(post.id);

    return responseStatus(res, 200, "Reaction updated", {
      likes: likers.length,
      likers,
      reactions: aggregateReactions(reactions),
      myReactionEmoji,
    });
  } catch (err) {
    console.error("addReaction:", err);
    return responseStatus(res, 500, "Failed to add reaction");
  }
};

const listComments = async (req, res) => {
  try {
    const comments = await WallComment.findAll({
      where: { post_id: req.params.id },
      order: [["created_at", "ASC"]],
    });
    return responseStatus(res, 200, "Comments loaded", {
      comments: comments.map(mapComment),
    });
  } catch (err) {
    console.error("listComments:", err);
    return responseStatus(res, 500, "Failed to load comments");
  }
};

const addComment = async (req, res) => {
  try {
    const author = authorFromRequest(req);
    if (!author) return responseStatus(res, 401, "Please sign in to comment");

    const { body } = req.body;
    if (!body?.trim()) return responseStatus(res, 400, "Comment body is required");

    const post = await WallPost.findByPk(req.params.id);
    if (!post) return responseStatus(res, 404, "Post not found");

    const comment = await WallComment.create({
      post_id: post.id,
      name: author.name,
      role: author.role,
      initials: author.initials,
      body: body.trim(),
    });

    post.comments_count += 1;
    await post.save();

    return responseStatus(res, 201, "Comment added", {
      comment: mapComment(comment),
      comments: post.comments_count,
    });
  } catch (err) {
    console.error("addComment:", err);
    return responseStatus(res, 500, "Failed to add comment");
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await WallComment.findByPk(req.params.commentId);
    if (!comment) return responseStatus(res, 404, "Comment not found");

    const post = await WallPost.findByPk(comment.post_id);
    await comment.destroy();
    if (post && post.comments_count > 0) {
      post.comments_count -= 1;
      await post.save();
    }

    return responseStatus(res, 200, "Comment deleted");
  } catch (err) {
    console.error("deleteComment:", err);
    return responseStatus(res, 500, "Failed to delete comment");
  }
};

const getStats = async (_req, res) => {
  try {
    const [topContributors] = await sequelize.query(`
      SELECT name, role, initials,
             COUNT(*) AS posts,
             SUM(likes) AS likes
      FROM wall_posts
      GROUP BY name, role, initials
      ORDER BY posts DESC, likes DESC
      LIMIT 10
    `);

    const [wordCloud] = await sequelize.query(`
      SELECT word, COUNT(*) AS count
      FROM wall_posts
      WHERE word IS NOT NULL AND word != ''
      GROUP BY word
      ORDER BY count DESC
      LIMIT 30
    `);

    const totalPosts = await WallPost.count();

    return responseStatus(res, 200, "Stats loaded", {
      totalPosts,
      topContributors: topContributors.map((c) => ({
        name: c.name,
        role: c.role,
        initials: c.initials,
        posts: Number(c.posts),
        likes: Number(c.likes),
        streak: Number(c.posts),
      })),
      wordCloud: wordCloud.map((w) => ({
        word: w.word,
        count: Number(w.count),
      })),
    });
  } catch (err) {
    console.error("getStats:", err);
    return responseStatus(res, 500, "Failed to load stats");
  }
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  listLikers,
  bookmarkPost,
  sharePost,
  savePost,
  votePoll,
  addReaction,
  listComments,
  addComment,
  deleteComment,
  getStats,
};
