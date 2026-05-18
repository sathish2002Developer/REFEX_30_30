export interface WallEntry {
  id: number;
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
  avatar_url?: string | null;
  word: string;
  body: string;
  tag: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  time: string;
  hasSketch?: boolean;
  postType: 'text' | 'reflection' | 'sketch' | 'image' | 'vision' | 'poll';
  imageUrl?: string;
  sketchUrl?: string;
  pollOptions?: PollOption[];
  isPinned?: boolean;
  isBookmarked?: boolean;
  reactions?: Reaction[];
  commentItems?: WallCommentItem[];
  likers?: WallLiker[];
  likedByMe?: boolean;
  pollVotedOptionId?: number | null;
  myReactionEmoji?: string | null;
}

export interface WallLiker {
  id: number;
  wallMemberId: number;
  name: string;
  role: string;
  initials: string;
}

export interface WallCommentItem {
  id: number;
  name: string;
  role: string;
  initials: string;
  body: string;
  time: string;
  avatarUrl?: string;
  avatar_url?: string | null;
}

export interface PollOption {
  id: number;
  label: string;
  shortLabel: string;
  votes: number;
  voters?: WallLiker[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  voters?: WallLiker[];
}

export interface Contributor {
  name: string;
  role: string;
  initials: string;
  posts: number;
  likes: number;
  streak: number;
}

export const wallEntries: WallEntry[] = [
  {
    id: 1,
    name: "Anil K.",
    role: "CEO, Energy Vertical",
    initials: "AK",
    word: "Bold",
    body: "Sitting in this session today, I realised — we've been thinking at the wrong altitude. 30B isn't a stretch target. It's a fundamentally different way of seeing ourselves. The businesses are there. The people are here. What changes now is the belief.",
    tag: "Reflection",
    likes: 34,
    comments: 12,
    shares: 8,
    saves: 5,
    time: "2 hours ago",
    postType: 'reflection',
    isPinned: true,
    reactions: [
      { emoji: "🔥", count: 12, users: ["PR", "SR", "VK"] },
      { emoji: "💡", count: 8, users: ["MN", "AK"] },
      { emoji: "👏", count: 14, users: ["PR", "SR", "VK", "MN"] },
    ]
  },
  {
    id: 2,
    name: "Priya R.",
    role: "CFO, Refex Group",
    initials: "PR",
    word: "Legacy",
    body: "Every crisis we've navigated as a group — we moved forward. The problem got left behind. That's not luck. That's who we are. This 30B vision is the natural evolution of our resilience.",
    tag: "Aspiration",
    likes: 48,
    comments: 15,
    shares: 11,
    saves: 7,
    time: "4 hours ago",
    postType: 'image',
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92e1c4e?w=600&h=400&fit=crop",
    reactions: [
      { emoji: "❤️", count: 18, users: ["AK", "SR"] },
      { emoji: "🔥", count: 22, users: ["VK", "MN", "PR"] },
      { emoji: "🚀", count: 8, users: ["AK"] },
    ]
  },
  {
    id: 3,
    name: "Sanjay R.",
    role: "Chief People Officer",
    initials: "SR",
    word: "Unstoppable",
    body: "The question I keep coming back to: what kind of culture needs to exist inside Refex to sustain a 30B organisation? It starts here. In this room. With how we choose to show up for each other. Culture eats strategy for breakfast, but aligned culture and strategy? That's unstoppable.",
    tag: "Challenge",
    likes: 27,
    comments: 9,
    shares: 4,
    saves: 3,
    time: "Yesterday",
    postType: 'text',
    reactions: [
      { emoji: "💡", count: 15, users: ["AK", "PR", "VK"] },
      { emoji: "🎯", count: 7, users: ["MN"] },
      { emoji: "👏", count: 5, users: ["PR"] },
    ]
  },
  {
    id: 4,
    name: "Vikram K.",
    role: "CTO, Digital Infrastructure",
    initials: "VK",
    word: "Scale",
    body: "Technology at 30B scale means rethinking every system we have today. The architecture, the talent, the partnerships — none of it survives a linear extrapolation. We need exponential thinking. Cloud-first, AI-native, data-driven. That's the only path.",
    tag: "Challenge",
    likes: 41,
    comments: 18,
    shares: 14,
    saves: 9,
    time: "Yesterday",
    postType: 'vision',
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    reactions: [
      { emoji: "🚀", count: 20, users: ["AK", "PR", "SR", "MN"] },
      { emoji: "💡", count: 12, users: ["PR", "VK"] },
      { emoji: "🔥", count: 9, users: ["SR", "MN"] },
    ]
  },
  {
    id: 5,
    name: "Meera N.",
    role: "Head of Mobility",
    initials: "MN",
    word: "Together",
    body: "I've seen what happens when 43 people truly align. The energy is palpable. The 30 By 30 vision gives us a north star — now we need to march together, not in silos. Cross-vertical collaboration will be our superpower.",
    tag: "Gratitude",
    likes: 56,
    comments: 22,
    shares: 16,
    saves: 11,
    time: "2 days ago",
    postType: 'text',
    reactions: [
      { emoji: "❤️", count: 28, users: ["AK", "PR", "SR", "VK"] },
      { emoji: "🤝", count: 16, users: ["PR", "MN"] },
      { emoji: "👏", count: 12, users: ["AK", "VK"] },
    ]
  },
  {
    id: 6,
    name: "Rahul S.",
    role: "VP, Strategy",
    initials: "RS",
    word: "Pivot",
    body: "Sometimes the biggest breakthrough comes from asking the question no one wants to ask. Are we building for the market of today or the market of 2030? The answer changes everything about our capital allocation, our hiring, our partnerships.",
    tag: "Challenge",
    likes: 19,
    comments: 7,
    shares: 3,
    saves: 2,
    time: "3 days ago",
    postType: 'poll',
    pollOptions: [
      { id: 0, label: "Build for 2030 market, invest aggressively", shortLabel: "Future-first", votes: 24 },
      { id: 1, label: "Balance today's revenue with tomorrow's bets", shortLabel: "Balanced", votes: 14 },
      { id: 2, label: "Strengthen current verticals first", shortLabel: "Core-first", votes: 5 },
    ],
    reactions: [
      { emoji: "🤔", count: 10, users: ["AK", "PR"] },
      { emoji: "💡", count: 6, users: ["VK", "MN"] },
    ]
  },
  {
    id: 7,
    name: "Deepa M.",
    role: "Head of Life Sciences",
    initials: "DM",
    word: "Impact",
    body: "What excites me most about 30B isn't the number — it's what that scale enables us to do for patients, for communities, for the planet. Impact at scale is the true north star. Revenue is the fuel, impact is the destination.",
    tag: "Aspiration",
    likes: 38,
    comments: 11,
    shares: 9,
    saves: 6,
    time: "3 days ago",
    postType: 'image',
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    reactions: [
      { emoji: "❤️", count: 20, users: ["AK", "PR", "SR", "VK", "MN"] },
      { emoji: "🌟", count: 12, users: ["PR", "DM"] },
      { emoji: "🙏", count: 6, users: ["SR"] },
    ]
  },
  {
    id: 8,
    name: "Karan T.",
    role: "Director, Infrastructure",
    initials: "KT",
    word: "Grit",
    body: "The road to 30B will not be smooth. There will be setbacks, market shocks, regulatory changes, competitive surprises. What separates the companies that make it from those that don't isn't avoiding the storm — it's learning to dance in the rain.",
    tag: "Reflection",
    likes: 31,
    comments: 8,
    shares: 7,
    saves: 4,
    time: "4 days ago",
    postType: 'text',
    reactions: [
      { emoji: "💪", count: 15, users: ["AK", "PR", "VK"] },
      { emoji: "🔥", count: 10, users: ["MN", "SR"] },
      { emoji: "👏", count: 6, users: ["PR", "KT"] },
    ]
  },
];

export const pollOptions: PollOption[] = [
  { id: 0, label: "Thinking at enterprise scale", shortLabel: "Enterprise thinking", votes: 34 },
  { id: 1, label: "Long-term over short-term", shortLabel: "Long-term focus", votes: 28 },
  { id: 2, label: "Collective over individual", shortLabel: "Collective ownership", votes: 42 },
  { id: 3, label: "Bold bets over safe moves", shortLabel: "Audacious bets", votes: 19 },
];

export const wordCloud = [
  { word: "Bold", size: 2 },
  { word: "Legacy", size: 3 },
  { word: "Unstoppable", size: 2 },
  { word: "Historic", size: 3 },
  { word: "Belief", size: 4 },
  { word: "Scale", size: 4 },
  { word: "Courage", size: 3 },
  { word: "Purpose", size: 5 },
  { word: "Together", size: 4 },
  { word: "Audacious", size: 5 },
  { word: "Dream", size: 5 },
  { word: "Build", size: 4 },
  { word: "Now", size: 5 },
  { word: "Transform", size: 3 },
  { word: "Future", size: 4 },
  { word: "Impact", size: 3 },
  { word: "Trust", size: 4 },
  { word: "Vision", size: 5 },
  { word: "Grit", size: 3 },
  { word: "Pivot", size: 2 },
  { word: "Resilience", size: 3 },
  { word: "Align", size: 4 },
];

export const topContributors: Contributor[] = [
  { name: "Meera N.", role: "Head of Mobility", initials: "MN", posts: 12, likes: 156, streak: 5 },
  { name: "Priya R.", role: "CFO", initials: "PR", posts: 10, likes: 142, streak: 4 },
  { name: "Vikram K.", role: "CTO", initials: "VK", posts: 9, likes: 128, streak: 4 },
  { name: "Anil K.", role: "CEO, Energy", initials: "AK", posts: 8, likes: 134, streak: 3 },
  { name: "Deepa M.", role: "Life Sciences", initials: "DM", posts: 7, likes: 98, streak: 3 },
];

export const dailyPrompts = [
  "What belief are you challenging today?",
  "What would you attempt if you knew you could not fail?",
  "Which strength of Refex are we underutilising?",
  "What does 'generational enterprise' mean to you personally?",
  "Who on this wall inspires you most this week?",
  "What's one audacious move we should make this quarter?",
  "If Refex was a person, what would their defining trait be?",
];

export const visionQuotes = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "Vision without action is merely a dream.", author: "Joel Barker" },
  { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];