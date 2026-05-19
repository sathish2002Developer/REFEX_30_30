import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  fetchCmsRevisionChanges,
  fetchCmsRevisions,
  revertCmsRevision,
  type CmsResourceType,
  type CmsRevisionRow,
  type CmsRevisionsList,
} from "../../services/cmsApi";
import { showAdminError, showAdminRevertSuccess } from "../../utils/adminToast";
import RevisionExpandRow from "./RevisionExpandRow";

export interface CmsVersionPanelHandle {
  refresh: () => Promise<CmsRevisionsList>;
}

interface CmsVersionPanelProps {
  resource: CmsResourceType;
  refreshKey?: number;
  onReverted?: () => void | Promise<void>;
}

const CmsVersionPanel = forwardRef<CmsVersionPanelHandle, CmsVersionPanelProps>(
  function CmsVersionPanel({ resource, refreshKey = 0, onReverted }, ref) {
    const [open, setOpen] = useState(false);
    const [revisions, setRevisions] = useState<CmsRevisionRow[]>([]);
    const [latestVersionNumber, setLatestVersionNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [autoExpandId, setAutoExpandId] = useState<number | null>(null);

    const load = useCallback(async () => {
      setLoading(true);
      setFetchError("");
      const { revisions: rows, latest_version_number } = await fetchCmsRevisions(resource);
      setRevisions(rows);
      setLatestVersionNumber(latest_version_number);
      setLoading(false);
      if (rows.length === 0) {
        const token = localStorage.getItem("leadership_cms_admin_token");
        if (!token) setFetchError("Sign in to admin to load version history.");
      }
      return { revisions: rows, latest_version_number };
    }, [resource]);

    const refreshVersions = useCallback(async () => {
      setOpen(true);
      const result = await load();
      if (result.revisions.length > 0) {
        setAutoExpandId(result.revisions[0].id);
      }
      return result;
    }, [load]);

    useImperativeHandle(ref, () => ({ refresh: refreshVersions }), [refreshVersions]);

    useEffect(() => {
      void load().then((result) => {
        if (result.revisions.length > 0) setOpen(true);
      });
    }, [load]);

    useEffect(() => {
      if (refreshKey <= 0) return;
      void refreshVersions();
    }, [refreshKey, refreshVersions]);

    const handleRevert = async (rev: CmsRevisionRow) => {
      const label = rev.label || `Version ${rev.version_number}`;
      if (
        !window.confirm(
          `Revert live content to "${label}"? Current content will be saved as a new version first.`
        )
      ) {
        return;
      }
      setBusyId(rev.id);
      const res = await revertCmsRevision(resource, rev.id);
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
      (revisionId: number) => fetchCmsRevisionChanges(resource, revisionId),
      [resource]
    );

    const totalVersions = latestVersionNumber || revisions[0]?.version_number || 0;
    const countLabel =
      totalVersions > 0
        ? ` (${totalVersions} version${totalVersions === 1 ? "" : "s"})`
        : "";
    const listTruncated =
      totalVersions > 0 && revisions.length > 0 && revisions.length < totalVersions;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
        >
          <span>
            Version history
            <span className="text-amber-400/90 font-normal">{countLabel}</span>
          </span>
          <span className="text-xs text-slate-500">{open ? "Hide" : "Show"}</span>
        </button>
        {open && (
          <div className="border-t border-slate-800 px-4 py-3 space-y-3">
            <p className="text-xs text-slate-500">
              Click ▶ on a version to see what changed in the next save. List updates after
              each save.
            </p>
            {listTruncated && (
              <p className="text-xs text-slate-500">
                Showing latest {revisions.length} of {totalVersions} versions.
              </p>
            )}
            {fetchError && (
              <p className="text-xs text-red-400 border border-red-500/30 rounded px-2 py-1">
                {fetchError}
              </p>
            )}
            {loading && <p className="text-xs text-slate-500">Loading versions…</p>}
            {!loading && !fetchError && revisions.length === 0 && (
              <p className="text-xs text-slate-500">
                No versions yet. Click Save on this form once — Version 1 will appear here.
              </p>
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
                  listRefreshKey={refreshKey}
                  initialExpanded={rev.id === autoExpandId}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
);

export default CmsVersionPanel;
