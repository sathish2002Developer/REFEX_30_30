import { useState, useEffect, useCallback, Fragment, FormEvent } from "react";
import {
  fetchWallAdminActivity,
  fetchWallPageCms,
  saveWallPageCms,
  type WallAdminActivityRow,
} from "../../services/cmsApi";
import {
  fetchWallPostCommentsPublic,
  fetchWallPostLikersPublic,
  type WallComment,
  type WallLiker,
} from "../../services/wallApi";
import type {
  WallContributorRowCms,
  WallPageCms,
  WallVisionQuoteRowCms,
  WallWordItemCms,
} from "../../types/wallPageCms";
import { mergeWallPageFromApi, wallPageCmsToPayload, DEFAULT_WALL_PAGE_CMS } from "../../types/wallPageCms";

type WallTab = "hero" | "feed" | "sidebar" | "activity";

type ActivityDetailRow =
  | { status: "loading" }
  | {
      status: "ok";
      likers: WallLiker[];
      likesCount: number;
      comments: WallComment[];
    }
  | { status: "err"; message: string };

const tabBtn = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
      : "text-slate-400 border border-transparent hover:bg-slate-800/80 hover:text-slate-200"
  }`;

export default function WallCmsPage() {
  const [tab, setTab] = useState<WallTab>("hero");
  const [w, setW] = useState<WallPageCms>(() => mergeWallPageFromApi(null));
  const [typingLinesText, setTypingLinesText] = useState(
    () => DEFAULT_WALL_PAGE_CMS.hero.typing_lines.join("\n")
  );
  const [dailyPromptsText, setDailyPromptsText] = useState(
    () => DEFAULT_WALL_PAGE_CMS.sidebar.daily_prompts.join("\n")
  );
  const [leaderInitialsText, setLeaderInitialsText] = useState(
    () => DEFAULT_WALL_PAGE_CMS.sidebar.leader_preview_initials.join(", ")
  );
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [activity, setActivity] = useState<WallAdminActivityRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [activityDetailByPost, setActivityDetailByPost] = useState<
    Record<number, ActivityDetailRow>
  >({});

  const loadActivityInteractions = useCallback(async (postId: number) => {
    let skip = false;
    setActivityDetailByPost((prev) => {
      if (prev[postId]?.status === "ok" || prev[postId]?.status === "loading") {
        skip = true;
        return prev;
      }
      return { ...prev, [postId]: { status: "loading" } };
    });
    if (skip) return;

    try {
      const [likesBag, comments] = await Promise.all([
        fetchWallPostLikersPublic(postId),
        fetchWallPostCommentsPublic(postId),
      ]);
      setActivityDetailByPost((prev) => ({
        ...prev,
        [postId]: {
          status: "ok",
          likers: likesBag.likers,
          likesCount: likesBag.likes,
          comments,
        },
      }));
    } catch {
      setActivityDetailByPost((prev) => ({
        ...prev,
        [postId]: {
          status: "err",
          message: "Could not load likes or comments",
        },
      }));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchWallPageCms();
      const merged = mergeWallPageFromApi(data);
      setW(merged);
      setTypingLinesText(merged.hero.typing_lines.join("\n"));
      setDailyPromptsText(merged.sidebar.daily_prompts.join("\n"));
      setLeaderInitialsText(merged.sidebar.leader_preview_initials.join(", "));
    })();
  }, []);

  useEffect(() => {
    if (tab !== "activity") return;
    let cancelled = false;
    (async () => {
      setActivityLoading(true);
      const rows = await fetchWallAdminActivity(60);
      if (!cancelled) {
        setActivity(rows);
        setActivityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const setWord = (i: number, patch: Partial<WallWordItemCms>) => {
    setW((prev) => {
      const word_cloud = [...prev.sidebar.word_cloud];
      word_cloud[i] = { ...word_cloud[i], ...patch };
      return { ...prev, sidebar: { ...prev.sidebar, word_cloud } };
    });
  };

  const addWord = () => {
    setW((prev) => ({
      ...prev,
      sidebar: { ...prev.sidebar, word_cloud: [...prev.sidebar.word_cloud, { word: "New", size: 2 }] },
    }));
  };

  const removeWord = (i: number) => {
    setW((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        word_cloud: prev.sidebar.word_cloud.filter((_, idx) => idx !== i),
      },
    }));
  };

  const setContributor = (i: number, patch: Partial<WallContributorRowCms>) => {
    setW((prev) => {
      const top_contributors = [...prev.sidebar.top_contributors];
      top_contributors[i] = { ...top_contributors[i], ...patch };
      return { ...prev, sidebar: { ...prev.sidebar, top_contributors } };
    });
  };

  const addContributor = () => {
    setW((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        top_contributors: [
          ...prev.sidebar.top_contributors,
          { name: "Name", role: "Role", initials: "XX", posts: 0, likes: 0, streak: 0 },
        ],
      },
    }));
  };

  const removeContributor = (i: number) => {
    setW((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        top_contributors: prev.sidebar.top_contributors.filter((_, idx) => idx !== i),
      },
    }));
  };

  const setQuote = (i: number, patch: Partial<WallVisionQuoteRowCms>) => {
    setW((prev) => {
      const vision_quotes = [...prev.sidebar.vision_quotes];
      vision_quotes[i] = { ...vision_quotes[i], ...patch };
      return { ...prev, sidebar: { ...prev.sidebar, vision_quotes } };
    });
  };

  const addQuote = () => {
    setW((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        vision_quotes: [...prev.sidebar.vision_quotes, { text: "", author: "" }],
      },
    }));
  };

  const removeQuote = (i: number) => {
    setW((prev) => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        vision_quotes: prev.sidebar.vision_quotes.filter((_, idx) => idx !== i),
      },
    }));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSavedMsg("");
    const typing_lines = typingLinesText
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const daily_prompts = dailyPromptsText
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const leader_preview_initials = leaderInitialsText
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payloadModel: WallPageCms = {
      ...w,
      hero: { ...w.hero, typing_lines },
      sidebar: { ...w.sidebar, daily_prompts, leader_preview_initials },
    };

    setLoading(true);
    const fd = new FormData();
    fd.append("payload", JSON.stringify(wallPageCmsToPayload(payloadModel)));
    const heroFile = (document.getElementById("wall-hero-bg") as HTMLInputElement | null)?.files?.[0];
    if (heroFile) fd.append("heroBackground", heroFile);

    const res = await saveWallPageCms(fd);
    setLoading(false);
    if (res.ok && res.data) {
      const merged = mergeWallPageFromApi(res.data);
      setW(merged);
      setTypingLinesText(merged.hero.typing_lines.join("\n"));
      setDailyPromptsText(merged.sidebar.daily_prompts.join("\n"));
      setLeaderInitialsText(merged.sidebar.leader_preview_initials.join(", "));
      setSavedMsg("Saved successfully.");
    } else {
      setSavedMsg(res.message || "Save failed");
    }
  };

  const heroImg = w.hero.hero_image_resolved_url || w.hero.hero_image_url;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-16">
      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-lg font-semibold">The Wall — page CMS</h1>
        <p className="text-xs text-slate-500 mt-1">
          {tab === "activity"
            ? "Read-only snapshot of live posts and polls on The Wall"
            : "Hero, feed labels, and right sidebar widgets"}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className={tabBtn(tab === "hero")} onClick={() => setTab("hero")}>
            Hero
          </button>
          <button type="button" className={tabBtn(tab === "feed")} onClick={() => setTab("feed")}>
            Feed labels
          </button>
          <button type="button" className={tabBtn(tab === "sidebar")} onClick={() => setTab("sidebar")}>
            Sidebar
          </button>
          <button
            type="button"
            className={tabBtn(tab === "activity")}
            onClick={() => setTab("activity")}
          >
            Feed activity
          </button>
        </div>
      </header>

      {tab === "activity" ? (
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            If public posts used to show as &quot;CMS Admin&quot;, that was the CMS operator email
            signing into The Wall. That email is now blocked for Wall login — use a leader email from{" "}
            <code className="text-amber-500/90">wallUsers.json</code> and sign out / sign in again on
            the site.
          </p>
          <p className="text-[11px] text-slate-600">
            Click a row to expand <span className="text-slate-400">who liked</span> and{" "}
            <span className="text-slate-400">who commented</span>.
          </p>
          {activityLoading ? (
            <p className="text-sm text-slate-400">Loading wall activity…</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-slate-400">No wall posts in the database yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium w-8" aria-hidden>
                      {""}
                    </th>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Author</th>
                    <th className="px-3 py-2 font-medium">Preview</th>
                    <th className="px-3 py-2 font-medium">Poll / meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activity.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className="hover:bg-slate-900/40 cursor-pointer"
                      tabIndex={0}
                      aria-expanded={expandedPostId === row.id}
                      onClick={() => {
                        if (expandedPostId === row.id) {
                          setExpandedPostId(null);
                          return;
                        }
                        setExpandedPostId(row.id);
                        void loadActivityInteractions(row.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (expandedPostId === row.id) {
                            setExpandedPostId(null);
                            return;
                          }
                          setExpandedPostId(row.id);
                          void loadActivityInteractions(row.id);
                        }
                      }}
                    >
                      <td className="px-2 py-2 text-slate-500 align-middle w-8">
                        <i
                          className={`ri-arrow-down-s-line text-lg transition-transform inline-block ${
                            expandedPostId === row.id ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-400 align-top tabular-nums">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-xs capitalize">
                          {row.post_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top min-w-[10rem]">
                        <span className="text-slate-200 font-medium block">{row.name}</span>
                        <span className="text-xs text-slate-500 block">{row.role}</span>
                        {row.author_email && (
                          <span className="text-[10px] text-slate-600 block truncate max-w-[12rem]" title={row.author_email}>
                            {row.author_email}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-300 align-top max-w-md">
                        <span className="line-clamp-3">{row.bodyPreview}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-400 align-top text-xs space-y-1">
                        <div>
                          {row.word && <span className="text-amber-600/90 mr-2">{row.word}</span>}
                          #{row.tag}
                        </div>
                        {row.poll_options?.length ? (
                          <ul className="mt-1 space-y-0.5 list-none">
                            {row.poll_options.slice(0, 4).map((o, i) => (
                              <li key={i}>
                                {o.label} <span className="text-slate-500">({o.votes} votes)</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-slate-600">
                            ♥ {row.likes} · comments {row.comments_count}
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedPostId === row.id ? (
                      <tr className="bg-slate-900/55">
                        <td colSpan={6} className="px-5 py-4 text-xs border-t border-slate-800/80">
                          {(() => {
                            const detail = activityDetailByPost[row.id];
                            if (!detail || detail.status === "loading") {
                              return <p className="text-slate-400 italic">Loading likes and comments…</p>;
                            }
                            if (detail.status === "err") {
                              return <p className="text-red-400">{detail.message}</p>;
                            }
                            return (
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-500/90 mb-2">
                                    Who liked ({detail.likesCount})
                                  </h4>
                                  {detail.likers.length === 0 ? (
                                    <p className="text-slate-500">No likes yet.</p>
                                  ) : (
                                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                                      {detail.likers.map((p) => (
                                        <li
                                          key={`${row.id}-like-${p.id}-${p.wallMemberId}`}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="w-8 h-8 shrink-0 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-semibold text-amber-200">
                                            {p.initials}
                                          </span>
                                          <span>
                                            <span className="text-slate-200 font-medium block">
                                              {p.name}
                                            </span>
                                            <span className="text-slate-500 text-[11px]">{p.role}</span>
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-500/90 mb-2">
                                    Comments ({detail.comments.length})
                                  </h4>
                                  {detail.comments.length === 0 ? (
                                    <p className="text-slate-500">No comments yet.</p>
                                  ) : (
                                    <ul className="space-y-3 max-h-48 overflow-y-auto">
                                      {detail.comments.map((c) => (
                                        <li
                                          key={`${row.id}-c-${c.id}`}
                                          className="border-l border-slate-700 pl-3"
                                        >
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-slate-200 font-medium">{c.name}</span>
                                            <span className="text-[10px] text-slate-600">{c.time}</span>
                                          </div>
                                          <p className="text-[11px] text-slate-500 mb-1">{c.role}</p>
                                          <p className="text-slate-300 leading-snug whitespace-pre-wrap break-words">
                                            {c.body}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        {savedMsg && (
          <p
            className={`text-sm px-4 py-2 rounded-lg ${
              savedMsg.includes("success")
                ? "bg-emerald-900/40 text-emerald-300"
                : "bg-red-900/30 text-red-300"
            }`}
          >
            {savedMsg}
          </p>
        )}

        <section className={`space-y-4 ${tab !== "hero" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Hero</h2>
          <p className="text-xs text-slate-500 break-all">Current image: {heroImg}</p>
          <label className="block text-xs text-slate-400">
            Background image URL (relative e.g. /images/wall-hero.svg — or uploads path /uploads/cms/… )
            <input
              type="text"
              value={w.hero.hero_image_url}
              onChange={(e) => setW({ ...w, hero: { ...w.hero, hero_image_url: e.target.value } })}
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            />
          </label>
          <input id="wall-hero-bg" type="file" accept="image/*" className="text-sm" />
          <label className="block text-xs">Eyebrow</label>
          <input
            value={w.hero.eyebrow}
            onChange={(e) => setW({ ...w, hero: { ...w.hero, eyebrow: e.target.value } })}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Typewriter lines (one per line)</label>
          <textarea
            rows={6}
            value={typingLinesText}
            onChange={(e) => setTypingLinesText(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Intro (supports line breaks)</label>
          <textarea
            rows={4}
            value={w.hero.intro}
            onChange={(e) => setW({ ...w, hero: { ...w.hero, intro: e.target.value } })}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </section>

        <section className={`space-y-4 ${tab !== "feed" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Feed UI</h2>
          {(
            [
              ["sign_in_hint", "Sign-in hint under composer"],
              ["post_count_loading", "Post count while loading"],
              ["post_count_suffix", "Word after count (e.g. posts)"],
              ["loading_the_wall", "Loading spinner caption"],
              ["empty_state", "Empty feed message"],
              ["refresh_posts", "Refresh button label"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs">
              {label}
              <input
                value={w.labels[key]}
                onChange={(e) => setW({ ...w, labels: { ...w.labels, [key]: e.target.value } })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </section>

        <section className={`space-y-6 ${tab !== "sidebar" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Sidebar</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs">
              Active leaders — title
              <input
                value={w.sidebar.active_leaders_title}
                onChange={(e) =>
                  setW({ ...w, sidebar: { ...w.sidebar, active_leaders_title: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              Active leaders — subtitle
              <input
                value={w.sidebar.active_leaders_sub}
                onChange={(e) =>
                  setW({ ...w, sidebar: { ...w.sidebar, active_leaders_sub: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              Total leaders (ring cap)
              <input
                type="number"
                min={1}
                max={500}
                value={w.sidebar.total_leaders_cap}
                onChange={(e) =>
                  setW({
                    ...w,
                    sidebar: { ...w.sidebar, total_leaders_cap: Number(e.target.value) || 43 },
                  })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs sm:col-span-2">
              Mini avatar initials (comma-separated, e.g. AK, PR, SR)
              <input
                value={leaderInitialsText}
                onChange={(e) => setLeaderInitialsText(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          </div>
          {(
            [
              ["trending_title", "Trending words title"],
              ["daily_reflection_title", "Daily reflection title"],
              ["new_prompt_label", "New prompt button"],
              ["top_contributors_title", "Top contributors title"],
              ["likes_word", "Likes column label"],
              ["vision_quote_title", "Vision quote title"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs">
              {label}
              <input
                value={w.sidebar[key]}
                onChange={(e) =>
                  setW({ ...w, sidebar: { ...w.sidebar, [key]: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          ))}

          <label className="block text-xs">Daily prompts (one per line)</label>
          <textarea
            rows={8}
            value={dailyPromptsText}
            onChange={(e) => setDailyPromptsText(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Word cloud</span>
              <button
                type="button"
                onClick={addWord}
                className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              >
                Add word
              </button>
            </div>
            <div className="space-y-2">
              {w.sidebar.word_cloud.map((item, i) => (
                <div key={i} className="flex gap-2 items-end border border-slate-800 rounded-lg p-2">
                  <label className="text-xs flex-1">
                    Word
                    <input
                      value={item.word}
                      onChange={(e) => setWord(i, { word: e.target.value })}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs w-24">
                    Size 1–5
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={item.size}
                      onChange={(e) => setWord(i, { size: Number(e.target.value) || 2 })}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeWord(i)}
                    className="text-xs text-red-400 px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Top contributors</span>
              <button
                type="button"
                onClick={addContributor}
                className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              >
                Add row
              </button>
            </div>
            <div className="space-y-3">
              {w.sidebar.top_contributors.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 sm:grid-cols-6 gap-2 border border-slate-800 rounded-lg p-2"
                >
                  <input
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) => setContributor(i, { name: e.target.value })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm sm:col-span-2"
                  />
                  <input
                    placeholder="Role"
                    value={c.role}
                    onChange={(e) => setContributor(i, { role: e.target.value })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm sm:col-span-2"
                  />
                  <input
                    placeholder="Initials"
                    value={c.initials}
                    onChange={(e) => setContributor(i, { initials: e.target.value })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Posts"
                    value={c.posts}
                    onChange={(e) => setContributor(i, { posts: Number(e.target.value) })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Likes"
                    value={c.likes}
                    onChange={(e) => setContributor(i, { likes: Number(e.target.value) })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Streak"
                    value={c.streak}
                    onChange={(e) => setContributor(i, { streak: Number(e.target.value) })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeContributor(i)}
                    className="text-xs text-red-400 sm:col-span-6 text-left"
                  >
                    Remove row
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Vision quotes</span>
              <button
                type="button"
                onClick={addQuote}
                className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              >
                Add quote
              </button>
            </div>
            <div className="space-y-3">
              {w.sidebar.vision_quotes.map((q, i) => (
                <div key={i} className="border border-slate-800 rounded-lg p-3 space-y-2">
                  <textarea
                    placeholder="Quote text"
                    rows={2}
                    value={q.text}
                    onChange={(e) => setQuote(i, { text: e.target.value })}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      placeholder="Author"
                      value={q.author}
                      onChange={(e) => setQuote(i, { author: e.target.value })}
                      className="flex-1 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuote(i)}
                      className="text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full bg-amber-500 text-slate-950 font-semibold disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Wall page"}
        </button>
      </form>
      )}
    </div>
  );
}
