import type { Reaction } from "../../../mocks/wallData";
import ParticipantsBar from "./ParticipantsBar";

interface ReactionsBarProps {
  reactions: Reaction[];
}

export default function ReactionsBar({ reactions }: ReactionsBarProps) {
  if (!reactions.length) return null;

  const rows = reactions.filter((r) => r.count > 0);
  if (!rows.length) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const voters = r.voters && r.voters.length > 0 ? r.voters : [];

        if (voters.length === 0) {
          return (
            <div key={r.emoji} className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs shadow-sm">
                <span className="leading-none">{r.emoji}</span>
                <span className="font-sans text-gray-600 font-medium tabular-nums">{r.count}</span>
              </span>
            </div>
          );
        }

        return (
          <ParticipantsBar
            key={r.emoji}
            participants={voters}
            total={r.count}
            modalTitle={`Reactions · ${r.emoji}`}
            trailingIcon={r.emoji}
            reactionPill={{ emoji: r.emoji, count: r.count }}
          />
        );
      })}
    </div>
  );
}
