import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  fetchWallMembersAdmin,
  createWallMemberAdmin,
  updateWallMemberAdmin,
  type WallMemberAdminRow,
} from "../../services/cmsApi";

const emptyForm = {
  name: "",
  email: "",
  designation: "",
  teamEntity: "",
  isActive: true,
};

export default function WallUsersPage() {
  const [rows, setRows] = useState<WallMemberAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WallMemberAdminRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const data = await fetchWallMembersAdmin(search, activeOnly);
    setRows(data);
    setLoading(false);
  }, [search, activeOnly]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setMsg("");
    setErr("");
  };

  const openEdit = (row: WallMemberAdminRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      designation: row.designation || "",
      teamEntity: row.team_entity || row.teamEntity || "",
      isActive: row.is_active,
    });
    setShowForm(true);
    setMsg("");
    setErr("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim(),
      teamEntity: form.teamEntity.trim(),
      isActive: form.isActive,
    };

    const r = editing
      ? await updateWallMemberAdmin(editing.id, payload)
      : await createWallMemberAdmin(payload);

    setSaving(false);
    if (!r.ok) {
      setErr(r.message || "Save failed");
      return;
    }
    setMsg(editing ? "User updated" : "User added");
    closeForm();
    await load();
  };

  const toggleActive = async (row: WallMemberAdminRow) => {
    setErr("");
    setMsg("");
    const r = await updateWallMemberAdmin(row.id, { isActive: !row.is_active });
    if (!r.ok) {
      setErr(r.message || "Update failed");
      return;
    }
    setMsg(`${row.name} ${row.is_active ? "deactivated" : "activated"}`);
    await load();
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Wall users</h1>
          <p className="text-sm text-slate-400 mt-1">
            Leaders who can sign in to the Refex Wall with their official email (no password).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-sm font-semibold hover:bg-amber-400"
        >
          Add user
        </button>
      </div>

      {msg && (
        <p className="mb-4 text-sm text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-2 bg-emerald-950/30">
          {msg}
        </p>
      )}
      {err && !showForm && (
        <p className="mb-4 text-sm text-red-400 border border-red-500/30 rounded-lg px-3 py-2 bg-red-950/30">
          {err}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name, email, team…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded border-slate-600"
          />
          Active only
        </label>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border border-slate-700 bg-slate-900/80 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-amber-400">
            {editing ? "Edit wall user" : "New wall user"}
          </h2>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Designation</label>
              <input
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Team / entity</label>
              <input
                value={form.teamEntity}
                onChange={(e) => setForm((f) => ({ ...f, teamEntity: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
              />
            </div>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-600"
              />
              Active (can sign in to wall)
            </label>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add user"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-lg border border-slate-600 text-sm hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/80 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Role</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium w-24">Status</th>
              <th className="px-4 py-3 font-medium w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No wall users found. Add one or run{" "}
                  <span className="font-mono text-slate-400">npm run seed:wall-users</span> in backend.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-800/80 hover:bg-slate-900/40"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-200">{row.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {row.role || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        row.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-700/50 text-slate-500"
                      }`}
                    >
                      {row.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleActive(row)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      {row.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
