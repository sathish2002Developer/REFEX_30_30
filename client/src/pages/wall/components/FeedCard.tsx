import { useState, useEffect, useCallback, useMemo } from "react";
import type { WallEntry } from "../../../mocks/wallData";
import type { WallComment, LikePostResult } from "../../../services/wallApi";
import {
  fetchWallComments,
  fetchWallPost,
  addWallComment,
  reactToWallPost,
  votePollOption,
} from "../../../services/wallApi";
import ParticipantsBar from "./ParticipantsBar";
import UserAvatar from "./UserAvatar";
import { resolveCommentAvatar } from "../../../utils/wallAvatar";
import { wallMediaUrl } from "../../../utils/wallMediaUrl";
import ReactionSummaryCluster from "./ReactionSummaryCluster";
import ReactionsBreakdownModal from "./ReactionsBreakdownModal";
import { useWallAuth } from "../../../context/WallAuthContext";
import type { WallUser } from "../../../services/wallAuth";

interface FeedCardProps {
  entry: WallEntry;
  currentUser?: WallUser | null;
  onLike: (id: number) => Promise<LikePostResult>;
  onBookmark: (id: number) => void;
  onPollUpdate?: (
    id: number,
    options: NonNullable<WallEntry["pollOptions"]>,
    pollVotedOptionId: number | null
  ) => void;
  onReactionUpdate?: (
    id: number,
    likes: number,
    likers: WallEntry["likers"],
    reactions: WallEntry["reactions"],
    myReactionEmoji: string | null
  ) => void;
}

export default function FeedCard({
  entry,
  currentUser,
  onLike,
  onBookmark,
  onPollUpdate,
  onReactionUpdate,
}: FeedCardProps) {
  const [liked, setLiked] = useState(entry.likedByMe || false);
  const [bookmarked, setBookmarked] = useState(entry.isBookmarked || false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentCount, setCommentCount] = useState(entry.comments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localLikes, setLocalLikes] = useState(entry.likes);
  const [likers, setLikers] = useState(entry.likers || []);
  const [comments, setComments] = useState<WallComment[]>(entry.commentItems || []);
  const [pollOptions, setPollOptions] = useState(entry.pollOptions);
  const [reactions, setReactions] = useState(entry.reactions);
  const toOptionId = (id: number | null | undefined) =>
    id != null && id !== undefined ? Number(id) : null;

  const [votedOptionId, setVotedOptionId] = useState<number | null>(
    toOptionId(entry.pollVotedOptionId)
  );
  const [myReactionEmoji, setMyReactionEmoji] = useState<string | null>(
    entry.myReactionEmoji ?? null
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const { requireAuth, refreshUser } = useWallAuth();

  const reactionSum = useMemo(
    () =>
      reactions?.reduce((acc, r) => acc + (typeof r.count === "number" ? r.count : 0), 0) ?? 0,
    [reactions]
  );

  /** WallLike rows (+ denormalised count fallback whenlikers omit). */
  const classicalLikeCount = useMemo(() => {
    if (likers.length > 0) return likers.length;
    if (reactionSum > 0) return 0;
    return Math.max(0, localLikes);
  }, [likers.length, reactionSum, localLikes]);

  const engagementTotal = reactionSum + classicalLikeCount;

  const openReactionBreakdown = useCallback(async () => {
    if (engagementTotal <= 0) return;
    setBreakdownOpen(true);
    setBreakdownLoading(true);
    try {
      const post = await fetchWallPost(entry.id);
      setLocalLikes(post.likes ?? 0);
      setLikers(post.likers ?? []);
      setReactions(post.reactions);
      setLiked(Boolean(post.likedByMe));
      setMyReactionEmoji(post.myReactionEmoji ?? null);
      onReactionUpdate?.(
        entry.id,
        post.likes ?? 0,
        post.likers,
        post.reactions,
        post.myReactionEmoji ?? null
      );
    } catch {
      /* keep existing card values */
    } finally {
      setBreakdownLoading(false);
    }
  }, [
    engagementTotal,
    entry.id,
    onReactionUpdate,
  ]);

  useEffect(() => {
    setPollOptions(entry.pollOptions);
    setReactions(entry.reactions);
    setLocalLikes(entry.likes);
    setLikers(entry.likers || []);
    setLiked(entry.likedByMe || false);
    setCommentCount(entry.comments);
    setBookmarked(entry.isBookmarked || false);
    setVotedOptionId(toOptionId(entry.pollVotedOptionId));
    setMyReactionEmoji(entry.myReactionEmoji ?? null);
  }, [entry]);

  const totalPollVotes = pollOptions?.reduce((sum, o) => sum + o.votes, 0) || 0;

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const list = await fetchWallComments(entry.id);
      setComments(list);
    } catch {
      /* keep existing */
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next) {
      void refreshUser();
      void loadComments();
    }
  };

  const handleLike = async () => {
    try {
      const result = await onLike(entry.id);
      setLocalLikes(result.likes);
      setLikers(result.likers);
      setLiked(result.likedByMe);
    } catch {
      /* parent handles auth */
    }
    setShowReactions(false);
  };

  const handleReaction = (emoji: string) => {
    requireAuth(async () => {
      try {
        const result = await reactToWallPost(entry.id, emoji);
        setLocalLikes(result.likes);
        setLikers(result.likers);
        setReactions(result.reactions);
        setMyReactionEmoji(result.myReactionEmoji);
        onReactionUpdate?.(
          entry.id,
          result.likes,
          result.likers,
          result.reactions,
          result.myReactionEmoji
        );
      } catch {
        /* ignore */
      }
      setShowReactions(false);
    });
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark(entry.id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const result = await addWallComment(entry.id, newComment.trim());
      setCommentCount(result.comments);
      setNewComment("");
      await loadComments();
    } catch {
      setCommentCount((prev) => prev + 1);
      setNewComment("");
    }
  };

  const handlePollVote = (optionId: number) => {
    if (votedOptionId !== null) return;
    requireAuth(async () => {
      try {
        const result = await votePollOption(entry.id, optionId);
        setPollOptions(result.pollOptions);
        setVotedOptionId(toOptionId(result.pollVotedOptionId));
        onPollUpdate?.(entry.id, result.pollOptions, result.pollVotedOptionId);
      } catch {
        /* ignore */
      }
    });
  };

  const hasVoted = votedOptionId !== null;

  const postTypeColors: Record<string, string> = {
    text: "bg-gray-100 text-gray-500",
    reflection: "bg-amber-50 text-amber-700",
    sketch: "bg-purple-50 text-purple-600",
    image: "bg-blue-50 text-blue-600",
    vision: "bg-emerald-50 text-emerald-600",
    poll: "bg-orange-50 text-orange-600",
  };

  const postTypeLabels: Record<string, string> = {
    text: "Thought",
    reflection: "Reflection",
    sketch: "Sketch",
    image: "Inspiration",
    vision: "Vision",
    poll: "Poll",
  };

  return (
    <div className="mb-5">
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-500">
        {entry.isPinned && (
          <div className="flex items-center gap-1.5 px-5 pt-4 pb-1">
            <i className="ri-pushpin-fill text-xs text-amber-600"></i>
            <span className="text-[10px] font-sans text-amber-600 tracking-wide uppercase">
              Pinned by Refex Leadership
            </span>
          </div>
        )}

        <div className="p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={entry} initials={entry.initials} className="w-10 h-10" />
            <div>
              <div className="text-sm font-sans text-gray-900 font-medium leading-tight">{entry.name}</div>
              <div className="text-xs font-sans text-gray-400 leading-tight">{entry.role}</div>
              <div className="text-[10px] font-sans text-gray-300 mt-0.5">{entry.time}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-medium tracking-wide ${postTypeColors[entry.postType] || postTypeColors.text}`}
            >
              {postTypeLabels[entry.postType] || "Thought"}
            </span>
          </div>
        </div>

        <div className="px-5 pb-3">
          <p className="text-sm font-sans text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.body}</p>
        </div>

        {entry.imageUrl && (
          <div className="px-5 pb-4">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={wallMediaUrl(entry.imageUrl) ?? entry.imageUrl}
                alt="Post image"
                className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {entry.hasSketch && (
          <div className="px-5 pb-4">
            {entry.sketchUrl ? (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={wallMediaUrl(entry.sketchUrl) ?? entry.sketchUrl}
                  alt="Sketch"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-slate-50 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-brush-line text-2xl text-gray-300 mb-1"></i>
                  <p className="text-xs font-sans text-gray-400">Sketch shared</p>
                </div>
              </div>
            )}
          </div>
        )}

        {entry.postType === "poll" && pollOptions && (
          <div className="px-5 pb-4 space-y-2">
            {!hasVoted && (
              <p className="text-[10px] font-sans text-gray-400 mb-1">Select one option to vote</p>
            )}
            {pollOptions.map((opt) => {
              const isSelected = votedOptionId === Number(opt.id);

              if (!hasVoted) {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePollVote(opt.id)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-left text-xs font-sans text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-all cursor-pointer"
                  >
                    {opt.shortLabel}
                  </button>
                );
              }

              const pct = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
              return (
                <div key={opt.id} className="space-y-1">
                  <div
                    className={`relative w-full rounded-lg ring-2 ${
                      isSelected ? "ring-amber-400" : "ring-transparent"
                    }`}
                  >
                    <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-amber-100 rounded-lg transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs font-sans text-gray-600 flex items-center gap-1.5">
                          {isSelected && (
                            <i className="ri-check-line text-amber-600 text-sm" aria-hidden />
                          )}
                          {opt.shortLabel}
                        </span>
                        <span className="text-xs font-sans text-amber-700 font-medium">{pct}%</span>
                      </div>
                    </div>
                  </div>
                  {opt.voters && opt.voters.length > 0 && (
                    <ParticipantsBar
                      participants={opt.voters}
                      total={opt.votes}
                      modalTitle={`${opt.shortLabel} · ${opt.votes} votes`}
                      className="pl-1"
                    />
                  )}
                </div>
              );
            })}
            {hasVoted && (
              <p className="text-[10px] font-sans text-gray-400">{totalPollVotes} votes</p>
            )}
          </div>
        )}

        <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
          {entry.word && (
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-sans font-semibold text-amber-700 tracking-wide">
              {entry.word}
            </span>
          )}
          {entry.tag && entry.tag !== entry.word && (
            <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-sans text-gray-500 tracking-wide">
              #{entry.tag}
            </span>
          )}
        </div>

        {engagementTotal > 0 && (
          <div className="mx-5 mb-0 rounded-lg bg-slate-50 border border-slate-100/80 overflow-hidden">
            <button
              type="button"
              onClick={() => void openReactionBreakdown()}
              className="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-slate-100/90 transition-colors cursor-pointer focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-1"
              aria-haspopup="dialog"
            >
              <ReactionSummaryCluster reactions={reactions} totalCount={engagementTotal} />
              <span className="sr-only">View who reacted</span>
            </button>
          </div>
        )}

        <div className="mx-5 h-px bg-gray-100 mt-3" />

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <button
                type="button"
                onClick={handleLike}
                title="React"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  liked || myReactionEmoji
                    ? "text-[#0a66c2] bg-sky-50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <i
                  className={`text-base ${
                    liked || myReactionEmoji ? "ri-thumb-up-fill" : "ri-thumb-up-line"
                  }`}
                />
                {engagementTotal <= 0 ? <span className="font-medium">Like</span> : null}
              </button>
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5 shadow-xl z-20 animate-scale-in">
                  {["❤️", "🔥", "💡", "👏", "🚀", "🤝"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(emoji)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-all text-lg cursor-pointer hover:scale-110 ${
                        myReactionEmoji === emoji ? "bg-amber-50 ring-2 ring-amber-300" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleComments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-all cursor-pointer"
            >
              <i className="ri-chat-1-line"></i>
              <span>{commentCount}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              bookmarked ? "text-amber-600 bg-amber-50" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            <i className={bookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
          </button>
        </div>

        {showComments && (
          <div className="px-5 pb-4 animate-slide-up">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              {loadingComments ? (
                <p className="text-xs text-gray-400 font-sans mb-3">Loading comments...</p>
              ) : (
                comments.length > 0 && (
                  <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <UserAvatar
                          avatarUrl={resolveCommentAvatar(c, currentUser) ?? c}
                          initials={c.initials}
                          className="w-7 h-7"
                        />
                        <div>
                          <div className="text-xs font-sans text-gray-900 font-medium">
                            {c.name} <span className="text-gray-400 font-normal">· {c.time}</span>
                          </div>
                          <p className="text-xs font-sans text-gray-600 mt-0.5">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {currentUser ? (
              <div className="flex items-center gap-2">
                <UserAvatar avatarUrl={currentUser} initials={currentUser.initials} className="w-7 h-7" />
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-xs font-sans text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
                </div>
              ) : (
                <p className="text-xs font-sans text-gray-400">Sign in to comment</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ReactionsBreakdownModal
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        reactions={reactions}
        classicalLikers={likers}
        classicalLikeCount={classicalLikeCount}
        engagementTotal={engagementTotal}
        loading={breakdownLoading}
      />
    </div>
  );
}
