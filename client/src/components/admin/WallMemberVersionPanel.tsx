import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  fetchWallMemberRevisionChanges,
  fetchWallMemberRevisions,
  revertWallMemberRevision,
  type WallMemberRevisionRow,
} from "../../services/cmsApi";
import { showAdminError, showAdminRevertSuccess } from "../../utils/adminToast";
import RevisionExpandRow from "./RevisionExpandRow";

export interface WallMemberVersionPanelHandle {
  refresh: () => Promise<WallMemberRevisionRow[]>;
}

interface WallMemberVersionPanelProps {
  memberId: number;
  refreshKey?: number;
  onReverted?: () => void | Promise<void>;
}

const WallMemberVersionPanel = forwardRef<
  WallMemberVersionPanelHandle,
  WallMemberVersionPanelProps
>(function WallMemberVersionPanel({ memberId, refreshKey = 0, onReverted }, ref) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<WallMemberRevisionRow[]>([]);
  const [latestVersionNumber, setLatestVersionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [autoExpandId, setAutoExpandId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { revisions: rows, latest_version_number } = await fetchWallMemberRevisions(memberId);
    setRevisions(rows);
    setLatestVersionNumber(latest_version_number);
    setLoading(false);
    return { revisions: rows, latest_version_number };
  }, [memberId]);

  const refreshVersions = useCallback(async () => {
    setOpen(true);
    const rows = await load();
    if (rows.length > 0) setAutoExpandId(rows[0].id);
    return rows;
  }, [load]);

  useImperativeHandle(ref, () => ({ refresh: refreshVersions }), [refreshVersions]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (refreshKey <= 0) return;
    void refreshVersions();
  }, [refreshKey, refreshVersions]);

  const handleRevert = async (rev: WallMemberRevisionRow) => {
    const label = rev.label || `Version ${rev.version_number}`;
    if (
      !window.confirm(
        `Revert this user to "${label}"? Profile fields will be restored; password will not change.`
      )
    ) {
      return;
    }
    setBusyId(rev.id);
    const res = await revertWallMemberRevision(memberId, rev.id);
    setBusyId(null);
    if (res.ok) {
      const text = res.message?.toLowerCase().includes("revert")
        ? res.message
        : `Successfully reverted to ${label}.`;
      showAdminRevertSuccess(text);
      await refreshVersions();
      await onReverted?.();
    } else {
      showAdminError(res.message || "Revert failed.");
    }
  };

  const loadChanges = useCallback(
    (revisionId: number) => fetchWallMemberRevisionChanges(memberId, revisionId),
    [memberId]
  );

  const totalVersions = latestVersionNumber || revisions[0]?.version_number || 0;
  const countLabel =
    totalVersions > 0
      ? ` (${totalVersions} version${totalVersions === 1 ? "" : "s"})`
      : "";
  const listTruncated =
    totalVersions > 0 && revisions.length > 0 && revisions.length < totalVersions;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800/80"
      >
        <span>
          Version history
          <span className="text-amber-400/90 font-normal">{countLabel}</span>
        </span>
        <span className="text-slate-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-800 px-3 py-2 space-y-2">
          <p className="text-[10px] text-slate-500">
            Click ▶ to see changes. Updates after each save.
          </p>
          {listTruncated && (
            <p className="text-[10px] text-slate-500">
              Showing latest {revisions.length} of {totalVersions} versions.
            </p>
          )}
          {loading && <p className="text-xs text-slate-500">Loading…</p>}
          {!loading && revisions.length === 0 && (
            <p className="text-xs text-slate-500">No versions yet — save once to create Version 1.</p>
          )}
          {!loading &&
            revisions.map((rev) => (
              <RevisionExpandRow
                key={`${rev.id}-${refreshKey}`}
                rev={{
                  id: rev.id,
                  version_number: rev.version_number,
                  label: rev.label,
                  created_at: rev.created_at,
                  created_by_email: rev.created_by_email,
                }}
                loadChanges={loadChanges}
                onRevert={() => void handleRevert(rev)}
                revertBusy={busyId === rev.id}
                compact
                listRefreshKey={refreshKey}
                initialExpanded={rev.id === autoExpandId}
              />
            ))}
        </div>
      )}
    </div>
  );
});

export default WallMemberVersionPanel;
