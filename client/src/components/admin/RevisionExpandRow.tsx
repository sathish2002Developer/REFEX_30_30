import { useEffect, useState } from "react";
import { labelForRevisionField } from "../../utils/revisionChangeLabels";
import type { RevisionChangeRow, RevisionChangesDetail } from "../../services/cmsApi";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

interface RevisionMeta {
  id: number;
  version_number: number;
  label: string;
  created_at: string;
  created_by_email?: string | null;
}

interface RevisionExpandRowProps {
  rev: RevisionMeta;
  loadChanges: (revisionId: number) => Promise<RevisionChangesDetail | null>;
  onRevert: () => void;
  revertBusy: boolean;
  compact?: boolean;
  listRefreshKey?: number;
  initialExpanded?: boolean;
}

export default function RevisionExpandRow({
  rev,
  loadChanges,
  onRevert,
  revertBusy,
  compact = false,
  listRefreshKey = 0,
  initialExpanded = false,
}: RevisionExpandRowProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<RevisionChangesDetail | null>(null);

  useEffect(() => {
    setDetail(null);
    if (!initialExpanded) setExpanded(false);
  }, [listRefreshKey, rev.id, initialExpanded]);

  useEffect(() => {
    if (!initialExpanded) return;
    let cancelled = false;
    (async () => {
      setExpanded(true);
      setLoading(true);
      const data = await loadChanges(rev.id);
      if (!cancelled) {
        setDetail(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialExpanded, rev.id, loadChanges, listRefreshKey]);

  const toggleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    setLoading(true);
    const data = await loadChanges(rev.id);
    setDetail(data);
    setLoading(false);
  };

  const pad = compact ? "px-2 py-1.5" : "px-3 py-2";
  const textSm = compact ? "text-xs" : "text-sm";
  const textXs = compact ? "text-[10px]" : "text-xs";

  return (
    <div className={`rounded-lg border border-slate-800 bg-slate-950/50 ${pad}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => void toggleExpand()}
          className="min-w-0 flex-1 text-left"
        >
          <p className={`${textSm} font-medium text-slate-200 flex items-center gap-1.5`}>
            <span className="text-slate-500">{expanded ? "▼" : "▶"}</span>
            {rev.label || `Version ${rev.version_number}`}
          </p>
          <p className={`${textXs} text-slate-500 truncate mt-0.5`}>
            {formatWhen(rev.created_at)}
            {rev.created_by_email ? ` · ${rev.created_by_email}` : ""}
          </p>
        </button>
        <button
          type="button"
          disabled={revertBusy}
          onClick={onRevert}
          className={`shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 ${
            compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
          }`}
        >
          {revertBusy ? "Reverting…" : "Revert"}
        </button>
      </div>

      {expanded && (
        <div className={`mt-2 pt-2 border-t border-slate-800/80 ${textXs}`}>
          {loading && <p className="text-slate-500">Loading changes…</p>}
          {!loading && detail && (
            <>
              <p className="text-slate-400 mb-2">{detail.summary}</p>
              <p className="text-slate-500 mb-1.5">
                Changes you made in the next save (from this version → updated content):
              </p>
              {detail.changes.length === 0 ? (
                <p className="text-slate-500 italic">No differences recorded.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {detail.changes.map((ch: RevisionChangeRow) => (
                    <li
                      key={ch.field}
                      className="rounded border border-slate-800/80 bg-slate-900/50 px-2 py-1.5"
                    >
                      <p className="font-medium text-amber-400/90">
                        {labelForRevisionField(ch.field)}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        <span className="text-red-400/80 line-through">{ch.from}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className="text-emerald-400/90">{ch.to}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {!loading && !detail && (
            <p className="text-red-400/80">Could not load change details.</p>
          )}
        </div>
      )}
    </div>
  );
}
