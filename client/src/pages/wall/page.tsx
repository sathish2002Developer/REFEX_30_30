import { useState, useCallback, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { WallEntry } from "../../mocks/wallData";
import WallHeader from "./components/WallHeader";
import CreatePost from "./components/CreatePost";
import FeedCard from "./components/FeedCard";
import RightSidebar from "./components/RightSidebar";
import {
  fetchWallPosts,
  fetchWallStats,
  createWallPost,
  likeWallPost,
  bookmarkWallPost,
  type WallTrendingWordStat,
  type CreatePostPayload,
} from "../../services/wallApi";
import { useWallAuth } from "../../context/WallAuthContext";
import { fetchWallPageCms } from "../../services/cmsApi";
import { mergeWallPageFromApi, type WallPageCms } from "../../types/wallPageCms";
import { wallThemeCssVars } from "../../utils/wallTheme";
import "./wallTheme.css";

export default function Wall() {
  const { user, requireAuth, refreshUser } = useWallAuth();

  useEffect(() => {
    if (user?.id) void refreshUser();
  }, [user?.id, refreshUser]);
  const [wallCms, setWallCms] = useState<WallPageCms>(() => mergeWallPageFromApi(null));
  const [entries, setEntries] = useState<WallEntry[]>([]);
  /** Full-page feed skeleton only before the first posts response. */
  const [postsBootLoading, setPostsBootLoading] = useState(true);
  /** Quiet refresh — keep showing current cards while reloading. */
  const [postsRefreshing, setPostsRefreshing] = useState(false);
  /** Wall hero CMS `/api/cms/wall` until first response. */
  const [wallCmsLoading, setWallCmsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [liveWordTrend, setLiveWordTrend] = useState<WallTrendingWordStat[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const refreshTrendingWords = useCallback(async () => {
    const stats = await fetchWallStats();
    setLiveWordTrend(Array.isArray(stats?.wordCloud) ? stats.wordCloud : []);
    setTrendingLoading(false);
  }, []);

  const loadPosts = useCallback(async (manualRefresh?: boolean) => {
    const showFullSpinner =
      !manualRefresh || entries.length === 0;

    try {
      if (showFullSpinner) {
        setPostsBootLoading(true);
      } else {
        setPostsRefreshing(true);
      }
      setError(null);
      const posts = await fetchWallPosts();
      setEntries(posts);
    } catch {
      setError("Could not load posts. Make sure the backend and MySQL are running.");
    } finally {
      void refreshTrendingWords();
      setPostsBootLoading(false);
      setPostsRefreshing(false);
    }
  }, [entries.length, refreshTrendingWords]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    void fetchWallPageCms()
      .then((data) => {
        if (!cancelled) setWallCms(mergeWallPageFromApi(data));
      })
      .finally(() => {
        if (!cancelled) setWallCmsLoading(false);
      });

    void fetchWallPosts()
      .then((posts) => {
        if (!cancelled) setEntries(posts);
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
          setError(
            "Could not load posts. Make sure the backend and MySQL are running."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPostsBootLoading(false);
          setPostsRefreshing(false);
        }
      });

    void refreshTrendingWords();

    return () => {
      cancelled = true;
    };
  }, [refreshTrendingWords]);

  const submitPost = useCallback(
    async (data: CreatePostPayload) => {
      setPosting(true);
      try {
        const newEntry = await createWallPost(data);
        setEntries((prev) => [newEntry, ...prev]);
        setError(null);
        await refreshTrendingWords();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save post");
      } finally {
        setPosting(false);
      }
    },
    [refreshTrendingWords]
  );

  const handlePost = useCallback(
    (data: CreatePostPayload) => {
      requireAuth(() => submitPost(data));
    },
    [requireAuth, submitPost]
  );

  const handleLike = useCallback(
    (id: number) =>
      new Promise<Awaited<ReturnType<typeof likeWallPost>>>((resolve, reject) => {
        requireAuth(async () => {
          try {
            const result = await likeWallPost(id);
            setEntries((prev) =>
              prev.map((e) =>
                e.id === id
                  ? {
                      ...e,
                      likes: result.likes,
                      likers: result.likers,
                      likedByMe: result.likedByMe,
                    }
                  : e
              )
            );
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      }),
    [requireAuth]
  );

  const handleBookmark = useCallback(
    (id: number) => {
      requireAuth(async () => {
        try {
          const isBookmarked = await bookmarkWallPost(id);
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, isBookmarked } : e))
          );
        } catch {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === id ? { ...e, isBookmarked: !e.isBookmarked } : e
            )
          );
        }
      });
    },
    [requireAuth]
  );

  const pageStyle = wallThemeCssVars(wallCms.theme);

  return (
   <>
     <Navbar />

<div
  className="min-h-screen wall-themed"
  style={{
    ...pageStyle,
    backgroundColor: "var(--wall-page-bg)",
    backgroundImage: "var(--wall-page-bg-image)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>

  <WallHeader
    hero={wallCms.hero}
    cmsLoading={wallCmsLoading}
    cmsLoadingHint={wallCms.labels.loading_the_wall}
  />

  <section className="px-4 md:px-8 lg:px-16 xl:px-24 py-8">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-sans">
            {error}
          </div>
        )}

        <div className="mb-6">
          <CreatePost onPost={handlePost} disabled={posting} />
          {!user && (
            <p className="mt-2 text-xs font-sans wall-muted-text text-center">
              {wallCms.labels.sign_in_hint}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 gap-3">
          <span className="text-xs font-sans wall-muted-text">
            {postsBootLoading
              ? wallCms.labels.post_count_loading
              : `${entries.length} ${wallCms.labels.post_count_suffix}`}
          </span>
          {postsRefreshing ? (
            <span className="text-xs font-sans wall-accent-text inline-flex items-center gap-1.5 opacity-90">
              <i className="ri-loader-4-line animate-spin"></i>
              Updating…
            </span>
          ) : null}
        </div>

        {postsBootLoading ? (
          <div className="text-center py-16">
            <i className="ri-loader-4-line text-3xl wall-accent-text animate-spin"></i>
            <p className="text-sm font-sans wall-muted-text mt-3">{wallCms.labels.loading_the_wall}</p>
          </div>
        ) : (
          <>
            <div
              className={`flex flex-col gap-5 transition-opacity duration-200 ${
                postsRefreshing ? "opacity-[0.88] pointer-events-none" : ""
              }`}
              aria-busy={postsRefreshing}
            >
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
                >
                  <FeedCard
                    entry={entry}
                    currentUser={user}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onPollUpdate={(id, options, pollVotedOptionId) =>
                      setEntries((prev) =>
                        prev.map((e) =>
                          e.id === id ? { ...e, pollOptions: options, pollVotedOptionId } : e
                        )
                      )
                    }
                    onReactionUpdate={(id, likes, likers, reactions, myReactionEmoji) =>
                      setEntries((prev) =>
                        prev.map((e) =>
                          e.id === id
                            ? { ...e, likes, likers, reactions, myReactionEmoji }
                            : e
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-inbox-line text-3xl text-gray-300 mb-3"></i>
                <p className="text-sm font-sans wall-muted-text">
                  {wallCms.labels.empty_state}
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="text-center mt-8">
          <button
            type="button"
            disabled={postsBootLoading || postsRefreshing}
            onClick={() => loadPosts(true)}
            className="px-6 py-2.5 wall-panel wall-btn-muted rounded-lg text-xs font-sans wall-muted-text transition-all cursor-pointer shadow-sm disabled:opacity-55 disabled:pointer-events-none"
          >
            {postsRefreshing ? (
              <span className="inline-flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                {wallCms.labels.refresh_posts}
              </span>
            ) : (
              wallCms.labels.refresh_posts
            )}
          </button>
        </div>
      </div>

      <RightSidebar
        cms={wallCms.sidebar}
        activeCount={entries.length + 35}
        liveWordTrend={liveWordTrend}
        trendingLoading={trendingLoading}
      />
    </div>
  </section>

  <Footer />
</div>
   </>
  );
}
