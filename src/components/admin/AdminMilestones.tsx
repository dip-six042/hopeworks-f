import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminApi, money, type AdminMilestone } from './adminApi';
import { AdminPage, Badge, Button, Card, Select, Table } from './AdminUI';

const STUCK_DAYS = 7;

function statusBadge(m: AdminMilestone) {
  if (m.status === 'submitted') return <Badge tone="amber">Waiting for review</Badge>;
  if (m.status === 'rejected') return <Badge tone="red">Changes requested</Badge>;
  return <Badge tone="blue">In progress</Badge>;
}

function waited(days?: number) {
  if (days === undefined) return '—';
  if (days === 0) return 'Today';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function AdminMilestones() {
  const { allPms } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState('submitted');
  const [rows, setRows] = useState<AdminMilestone[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [choice, setChoice] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await adminApi.milestones(status));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const reassign = async (m: AdminMilestone) => {
    const pmId = choice[m.projectId];
    const pm = allPms.find((p) => p.id === pmId);
    if (!pm) return;
    setReassigning(m.projectId);
    try {
      await adminApi.assignPm(m.projectId, pm.id, pm.name);
      toast.success(`${pm.name} is now the Project Manager for "${m.projectTitle}".`);
      setChoice((c) => ({ ...c, [m.projectId]: '' }));
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReassigning(null);
    }
  };

  const stuck = rows?.filter((r) => r.status === 'submitted' && (r.daysWaiting ?? 0) >= STUCK_DAYS).length ?? 0;

  return (
    <AdminPage
      title="Milestones"
      description={
        status === 'submitted' && rows
          ? `${rows.length} waiting for a Project Manager${stuck ? ` · ${stuck} waiting ${STUCK_DAYS}+ days` : ''}`
          : 'Track milestone reviews and move them along.'
      }
      actions={<Button variant="ghost" onClick={load} loading={loading}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>}
    >
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100">
          <Select label="Show" value={status} onChange={setStatus}>
            <option value="submitted">Waiting for review</option>
            <option value="rejected">Changes requested</option>
            <option value="in_progress">In progress</option>
            <option value="">All open milestones</option>
          </Select>
        </div>

        {error && <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

        <Table
          head={['Campaign', 'Milestone', 'Value', 'Status', 'Waiting', 'Project Manager', '']}
          loading={loading && !rows}
          empty={!loading && rows?.length === 0}
        >
          {rows?.map((m) => {
            const isStuck = m.status === 'submitted' && (m.daysWaiting ?? 0) >= STUCK_DAYS;
            return (
              <tr key={m.id} className={isStuck ? 'bg-amber-50/40' : ''}>
                <td className="px-4 py-2.5">
                  <div className="text-slate-900 max-w-[220px] truncate">{m.projectTitle}</div>
                  {m.ownerName && <div className="text-xs text-slate-500">{m.ownerName}</div>}
                </td>
                <td className="px-4 py-2.5">
                  <div className="text-slate-900">#{m.number} {m.title}</div>
                  {m.status === 'submitted' && <div className="text-xs text-slate-500">{m.evidenceCount} {m.evidenceCount === 1 ? 'file' : 'files'} of proof</div>}
                  {m.status === 'rejected' && m.feedback && <div className="text-xs text-slate-500 max-w-[260px] truncate">“{m.feedback}”</div>}
                </td>
                <td className="px-4 py-2.5 tabular-nums">{money(m.cost)}</td>
                <td className="px-4 py-2.5">{statusBadge(m)}</td>
                <td className={`px-4 py-2.5 whitespace-nowrap ${isStuck ? 'text-amber-800 font-medium' : 'text-slate-600'}`}>{waited(m.daysWaiting)}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{m.pmName ?? <span className="text-red-700">None assigned</span>}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <select
                      aria-label={`New Project Manager for ${m.projectTitle}`}
                      value={choice[m.projectId] ?? ''}
                      onChange={(e) => setChoice((c) => ({ ...c, [m.projectId]: e.target.value }))}
                      className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 max-w-[150px]"
                    >
                      <option value="">{m.pmName ? 'Change PM…' : 'Assign PM…'}</option>
                      {allPms.filter((p) => p.id !== m.pmId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Button
                      variant="secondary"
                      disabled={!choice[m.projectId]}
                      loading={reassigning === m.projectId}
                      onClick={() => reassign(m)}
                    >
                      Save
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <p className="text-xs text-slate-500">
        Rows highlighted in yellow have been waiting for review for {STUCK_DAYS} days or more. Changing the Project Manager notifies the new one straight away.
      </p>
    </AdminPage>
  );
}
