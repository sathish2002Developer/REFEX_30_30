import type { Reaction } from "../../../mocks/wallData";

/** LinkedIn-inspired colored circles behind emoji glyphs */
function bubbleClasses(emoji: string): string {
  const map: Record<string, string> = {
    "❤️": "bg-[#DF704D]",
    "👏": "bg-[#478a6b]",
    "👍": "bg-[#378fe9]",
    "🔥": "bg-[#ea580c]",
    "💡": "bg-[#ca8e00]",
    "🚀": "bg-[#6b4dc4]",
    "🤝": "bg-[#0a66c2]",
    "😊": "bg-[#f5b836]",
    "💪": "bg-[#059669]",
  };
  return map[emoji] ?? "bg-slate-500";
}

interface ReactionSummaryClusterProps {
  reactions: Reaction[] | undefined;
  /** Total engagements (likes + emoji reactions), from API */
  totalCount: number;
}

export default function ReactionSummaryCluster({
  reactions,
  totalCount,
}: ReactionSummaryClusterProps) {
  if (totalCount <= 0) return null;

  const nonzero = [...(reactions ?? [])].filter((r) => r.count > 0);
  nonzero.sort((a, b) => b.count - a.count);
  const emojis =
    nonzero.length > 0
      ? Array.from(new Set(nonzero.slice(0, 3).map((r) => r.emoji)))
      : [totalCount > 0 ? "👍" : "❤️"];

  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(totalCount);

  return (
    <div className="flex items-center gap-3 min-h-[34px]" aria-label={`${formatted} reactions`}>
      <div className="flex items-center shrink-0" style={{ paddingLeft: emojis.length > 1 ? 4 : 0 }}>
        {emojis.map((emoji, i) => (
          <span
            key={`${emoji}-${i}`}
            className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white text-[13px] leading-none shadow-sm ${bubbleClasses(emoji)} ${i > 0 ? "-ml-2.5" : ""}`}
            style={{ zIndex: emojis.length - i }}
            aria-hidden
          >
            <span className="drop-shadow-sm [filter:none]">{emoji}</span>
          </span>
        ))}
      </div>
      <span className="text-[13px] font-sans font-medium tabular-nums text-slate-600">
        {formatted}
      </span>
    </div>
  );
}
