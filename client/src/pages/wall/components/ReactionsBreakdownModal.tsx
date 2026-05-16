import type { Reaction, WallLiker } from "../../../mocks/wallData";

interface ReactionsBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  reactions: Reaction[] | undefined;
  classicalLikers: WallLiker[];
  classicalLikeCount: number;
  engagementTotal: number;
  loading?: boolean;
}

function formatCompactNames(parts: WallLiker[], knownTotal: number): string {
  if (parts.length === 0) return `${knownTotal} reaction${knownTotal === 1 ? "" : "s"}`;
  if (knownTotal <= 1) return parts[0]?.name ?? "1 reaction";
  if (knownTotal === 2 && parts.length >= 2) return `${parts[0]?.name} and ${parts[1]?.name}`;
  if (knownTotal === 2 && parts.length === 1) return `${parts[0]?.name} and 1 other`;
  const rest = knownTotal - 1;
  return `${parts[0]?.name} and ${rest} others`;
}

function voterRow(parts: WallLiker[], overflow: number) {
  const shown = parts.slice(0, 8);
  return (
    <>
      <div className="flex items-center -space-x-2 shrink-0 ml-2">
        {shown.map((person, i) => (
          <div
            key={person.id}
            title={person.name}
            className="w-8 h-8 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-amber-800 shadow-sm"
            style={{ zIndex: shown.length - i }}
          >
            {person.initials}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-slate-600">
            +{overflow}
          </div>
        )}
      </div>
    </>
  );
}

export default function ReactionsBreakdownModal({
  open,
  onClose,
  reactions,
  classicalLikers,
  classicalLikeCount,
  engagementTotal,
  loading,
}: ReactionsBreakdownModalProps) {
  if (!open) return null;

  const nonzero = [...(reactions ?? [])]
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const labelSuffix =
    engagementTotal === 1 ? "reaction" : "reactions";

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[75vh] flex flex-col overflow-hidden animate-scale-in">
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-xs font-sans uppercase tracking-wide text-slate-500">
              {loading ? "Loading…" : `${engagementTotal} ${labelSuffix}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
            aria-label="Close dialog"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </header>

        <div className="overflow-y-auto p-3 flex flex-col gap-2">
          {loading && nonzero.length === 0 && classicalLikers.length === 0 && (
            <p className="text-sm text-slate-500 px-3 py-4 font-sans">Fetching reactions…</p>
          )}
          {!loading &&
            nonzero.length === 0 &&
            classicalLikers.length === 0 &&
            engagementTotal === 0 && (
              <p className="text-sm text-slate-500 px-3 py-4 font-sans">No reactions yet.</p>
            )}
          {nonzero.map((r) => {
            const voters = r.voters && r.voters.length > 0 ? r.voters : [];
            const overflow =
              voters.length >= r.count ? 0 : Math.max(0, r.count - voters.length);

            return (
              <div
                key={r.emoji}
                className="rounded-xl px-3 py-2.5 flex items-start gap-2 bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors"
              >
                <span className="inline-flex items-center gap-1 shrink-0 px-2 py-1 bg-white rounded-full text-xs shadow-sm border border-slate-100">
                  <span className="leading-none">{r.emoji}</span>
                  <span className="font-sans tabular-nums font-medium text-slate-700">{r.count}</span>
                </span>
                <div className="flex flex-1 min-w-0 items-start justify-between gap-2">
                  {voters.length > 0 && (
                    <span className="text-[13px] font-sans text-amber-900/85 leading-snug pt-1 text-left truncate">
                      {formatCompactNames(voters, r.count)}
                    </span>
                  )}
                  {voters.length === 0 && (
                    <span className="text-[13px] font-sans text-slate-500 pt-1">No names loaded</span>
                  )}
                  {voters.length > 0 ? voterRow(voters, overflow) : null}
                </div>
              </div>
            );
          })}

          {classicalLikeCount > 0 && classicalLikers.length > 0 && (
            <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
              <span className="inline-flex items-center gap-1 shrink-0 px-2 py-1 bg-white rounded-full text-xs shadow-sm border border-slate-100">
                <i className="ri-thumb-up-fill text-[#378fe9] text-sm leading-none" aria-hidden />
                <span className="font-sans tabular-nums font-medium text-slate-700">{classicalLikeCount}</span>
              </span>
              <div className="flex flex-1 min-w-0 items-start justify-between gap-2">
                <span className="text-[13px] font-sans text-amber-900/85 leading-snug pt-1 text-left truncate">
                  {formatCompactNames(classicalLikers, classicalLikeCount)}
                </span>
                {voterRow(classicalLikers, Math.max(0, classicalLikeCount - classicalLikers.length))}
              </div>
            </div>
          )}

          {classicalLikeCount > 0 && classicalLikers.length === 0 && !loading && (
            <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 bg-amber-50/40 border border-amber-100/80">
              <span className="inline-flex items-center gap-1 shrink-0 px-2 py-1 bg-white rounded-full text-xs shadow-sm border border-amber-100/80">
                <i className="ri-thumb-up-fill text-[#378fe9] text-sm leading-none" aria-hidden />
                <span className="font-sans tabular-nums font-medium text-slate-700">{classicalLikeCount}</span>
              </span>
              <p className="text-[13px] font-sans text-slate-600 leading-snug pt-0.5">
                Loading names didn&apos;t complete. Close and tap again to refresh the list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
