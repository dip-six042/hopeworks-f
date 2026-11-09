import React, { useCallback, useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getGovIdUrl } from '../../lib/apiClient';
import type { UserRole } from '../../types';
import {
  adminApi, downloadExport, money, shortDate, timeAgo, ROLE_LABELS,
  type AdminUserDetail, type AdminUserList, type AdminUserRow,
} from './adminApi';
import { AdminPage, Badge, Button, Card, Drawer, ReasonDialog, Select, Table } from './AdminUI';

const PAGE_SIZE = 25;
const ALL_ROLES: UserRole[] = ['donor', 'volunteer', 'entrepreneur', 'project_manager', 'admin'];

function idBadge(status: AdminUserRow['verificationStatus']) {
  if (status === 'approved') return <Badge tone="green">ID checked</Badge>;
  if (status === 'pending') return <Badge tone="amber">ID waiting</Badge>;
  if (status === 'rejected') return <Badge tone="red">ID rejected</Badge>;
  return <Badge>No ID</Badge>;
}

export function AdminUsers() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.users({ search: debounced, role, status, sort, page, pageSize: PAGE_SIZE }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [debounced, role, status, sort, page]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const from = data && data.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = data ? Math.min(page * PAGE_SIZE, data.total) : 0;

  const exportUsers = async () => {
    setExporting(true);
    try { await downloadExport('users'); } catch (e) { toast.error((e as Error).message); } finally { setExporting(false); }
  };

  return (
    <AdminPage
      title="Users"
      description={data ? `${data.total.toLocaleString()} ${data.total === 1 ? 'person' : 'people'}` : 'Everyone registered on HopeWorks.'}
      actions={<Button onClick={exportUsers} loading={exporting}><Download className="h-3.5 w-3.5" /> Export CSV</Button>}
    >
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or location"
              aria-label="Search users"
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <Select label="Role" value={role} onChange={(v) => { setRole(v); setPage(1); }}>
            <option value="">All roles</option>
            {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
          <Select label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="id_pending">ID waiting</option>
            <option value="id_approved">ID checked</option>
            <option value="id_none">No ID / rejected</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(v) => { setSort(v); setPage(1); }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="last_seen">Recently active</option>
          </Select>
        </div>

        {error && <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

        <Table
          head={['Name', 'Roles', 'Status', 'Joined', 'Last seen', 'Campaigns', 'Donated']}
          loading={loading && !data}
          empty={!loading && data?.users.length === 0}
        >
          {data?.users.map((u) => (
            <tr key={u.id} onClick={() => setOpenId(u.id)} className="hover:bg-slate-50 cursor-pointer">
              <td className="px-4 py-2.5">
                <div className="font-medium text-slate-900">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {u.roles.length ? u.roles.map((r) => <React.Fragment key={r}><Badge tone={r === 'admin' ? 'blue' : 'gray'}>{ROLE_LABELS[r]}</Badge></React.Fragment>) : <span className="text-xs text-slate-400">None</span>}
                </div>
              </td>
              <td className="px-4 py-2.5">{u.isSuspended ? <Badge tone="red">Suspended</Badge> : idBadge(u.verificationStatus)}</td>
              <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{shortDate(u.createdAt)}</td>
              <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{timeAgo(u.lastSignInAt)}</td>
              <td className="px-4 py-2.5 tabular-nums text-slate-600">{u.campaignsCount}</td>
              <td className="px-4 py-2.5 tabular-nums text-slate-600 whitespace-nowrap">{u.donationsCount ? `${money(u.donationsTotal)} · ${u.donationsCount}` : '—'}</td>
            </tr>
          ))}
        </Table>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
          <span>{data ? `${from.toLocaleString()}–${to.toLocaleString()} of ${data.total.toLocaleString()}` : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="tabular-nums">Page {page} of {totalPages}</span>
            <Button variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      <UserDrawer userId={openId} onClose={() => setOpenId(null)} onChanged={load} />
    </AdminPage>
  );
}

function UserDrawer({ userId, onClose, onChanged }: { userId: string | null; onClose: () => void; onChanged: () => void }) {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [askSuspend, setAskSuspend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const d = await adminApi.user(userId);
      setDetail(d);
      setRoles(d.profile.roles);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => { setDetail(null); void load(); }, [load]);

  const p = detail?.profile;
  const isMe = !!p && p.id === me?.id;
  const rolesChanged = !!p && [...roles].sort().join() !== [...p.roles].sort().join();

  const saveRoles = async () => {
    if (!p) return;
    setBusy(true);
    try {
      await adminApi.setRoles(p.id, roles);
      toast.success('Roles updated.');
      await load();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const suspend = async (reason: string) => {
    if (!p) return;
    setBusy(true);
    try {
      const r = await adminApi.suspend(p.id, reason);
      toast.success(`${p.name} is suspended.${r.paused ? ` ${r.paused} campaign${r.paused === 1 ? '' : 's'} paused.` : ''}`);
      setAskSuspend(false);
      await load();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const unsuspend = async () => {
    if (!p) return;
    setBusy(true);
    try {
      await adminApi.unsuspend(p.id);
      toast.success(`${p.name} can sign in again. Their paused campaigns stay paused until you resume them.`);
      await load();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const viewId = async () => {
    if (!p) return;
    const win = window.open('about:blank', '_blank');
    if (win) win.opener = null;
    try {
      const url = await getGovIdUrl(p.id);
      if (win) win.location.replace(url); else window.location.assign(url);
    } catch (e) {
      win?.close();
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <Drawer open={!!userId} onClose={onClose} title={p?.name ?? 'User'}>
        {loading && !detail && <p className="text-sm text-slate-500">Loading…</p>}
        {p && detail && (
          <div className="space-y-6 text-sm">
            {p.isSuspended && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <div className="font-medium">Suspended</div>
                {p.suspendedReason && <div className="text-xs mt-0.5">Reason: {p.suspendedReason}</div>}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Email">{p.email}</Field>
              <Field label="Location">{p.location || '—'}</Field>
              <Field label="Joined">{shortDate(p.createdAt)}</Field>
              <Field label="Last signed in">{timeAgo(detail.lastSignInAt)}</Field>
              <Field label="ID check">
                <span className="inline-flex items-center gap-2">
                  {idBadge(p.verificationStatus as AdminUserRow['verificationStatus'])}
                  {p.govIdUrl && <button onClick={viewId} className="text-xs underline cursor-pointer">View ID</button>}
                </span>
              </Field>
              <Field label="Website">{p.website ? <a href={p.website} target="_blank" rel="noreferrer noopener" className="underline break-all">{p.website}</a> : '—'}</Field>
            </dl>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((r) => {
                  const on = roles.includes(r);
                  const lockSelfAdmin = isMe && r === 'admin';
                  return (
                    <label key={r} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-700'} ${lockSelfAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        disabled={lockSelfAdmin}
                        onChange={() => setRoles((cur) => (on ? cur.filter((x) => x !== r) : [...cur, r]))}
                      />
                      {ROLE_LABELS[r]}
                    </label>
                  );
                })}
              </div>
              {rolesChanged && (
                <div className="mt-2 flex gap-2">
                  <Button variant="primary" onClick={saveRoles} loading={busy}>Save roles</Button>
                  <Button variant="ghost" onClick={() => setRoles(p.roles)}>Undo</Button>
                </div>
              )}
              {isMe && <p className="text-xs text-slate-400 mt-1.5">You can't remove your own admin role.</p>}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Campaigns ({detail.campaigns.length})</h3>
              {detail.campaigns.length === 0 ? <p className="text-slate-500">None</p> : (
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {detail.campaigns.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate">{c.title}</span>
                      <span className="shrink-0 text-xs text-slate-500">{c.status} · {money(c.fundingRaised)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Donations ({detail.donations.length})</h3>
              {detail.donations.length === 0 ? <p className="text-slate-500">None</p> : (
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {detail.donations.slice(0, 20).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate">{d.projectName}</span>
                      <span className="shrink-0 text-xs text-slate-500">{money(d.amount)} · {d.status ?? 'paid'} · {shortDate(d.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Volunteer applications ({detail.applications.length})</h3>
              {detail.applications.length === 0 ? <p className="text-slate-500">None</p> : (
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {detail.applications.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate">{a.projectName}</span>
                      <span className="shrink-0 text-xs text-slate-500">{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Activity</h3>
              {detail.activity.length === 0 ? <p className="text-slate-500">Nothing yet</p> : (
                <ul className="space-y-2">
                  {detail.activity.slice(0, 15).map((a) => (
                    <li key={a.id} className="text-xs">
                      <span className="text-slate-400">{shortDate(a.timestamp)}</span>{' '}
                      <span className="font-medium text-slate-700">{a.actionType.replace(/_/g, ' ').toLowerCase()}</span>
                      {a.affectedEntityName ? <> · {a.affectedEntityName}</> : null}
                      {a.rationale ? <div className="text-slate-500">{a.rationale}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {!isMe && (
              <section className="pt-4 border-t border-slate-200">
                {p.isSuspended ? (
                  <Button onClick={unsuspend} loading={busy}>Restore account</Button>
                ) : (
                  <>
                    <Button variant="danger" onClick={() => setAskSuspend(true)} disabled={p.roles.includes('admin')}
                      title={p.roles.includes('admin') ? 'Remove the admin role first' : undefined}>
                      Suspend account
                    </Button>
                    <p className="text-xs text-slate-500 mt-1.5">They'll be signed out, can't sign back in, and their live campaigns are paused. Nothing is deleted.</p>
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={askSuspend}
        title={`Suspend ${p?.name ?? 'this user'}?`}
        message="They'll be signed out straight away and their live campaigns will stop taking donations. You can restore the account later."
        confirmLabel="Suspend"
        danger
        busy={busy}
        onCancel={() => setAskSuspend(false)}
        onConfirm={suspend}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 truncate">{children}</dd>
    </div>
  );
}
