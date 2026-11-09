import React, { useEffect, useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { adminApi, money, type AdminOverview as Overview } from './adminApi';
import { AdminPage, Button, Card, StatTile } from './AdminUI';
import { BarChart } from './BarChart';

type Go = (segment: 'users' | 'id_queue' | 'campaign_desk' | 'audit_desk') => void;

export function AdminOverview({ onGo }: { onGo: Go }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.overview());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const todo = data
    ? [
        { n: data.ids_to_check, text: 'ID documents to check', go: () => onGo('id_queue') },
        { n: data.pending_campaigns, text: 'campaigns waiting for approval', go: () => onGo('campaign_desk') },
        { n: data.campaigns_without_pm, text: 'live campaigns with no Project Manager', go: () => onGo('campaign_desk') },
        { n: data.milestones_waiting, text: 'milestones waiting for a Project Manager’s review', go: () => onGo('campaign_desk') },
        { n: data.paused_campaigns, text: 'paused campaigns', go: () => onGo('campaign_desk') },
      ].filter((t) => t.n > 0)
    : [];

  return (
    <AdminPage
      title="Overview"
      description="What's happening on HopeWorks and what needs you."
      actions={<Button onClick={load} loading={loading} variant="ghost"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>}
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn't load the overview: {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Users" value={data ? data.total_users.toLocaleString() : '—'}
          hint={data ? `+${data.new_users_7d} this week` : undefined} onClick={() => onGo('users')} />
        <StatTile label="Live campaigns" value={data ? data.live_campaigns : '—'}
          hint={data ? `${data.pending_campaigns} waiting · ${data.paused_campaigns} paused` : undefined} onClick={() => onGo('campaign_desk')} />
        <StatTile label="Total raised" value={data ? money(data.total_raised) : '—'}
          hint={data ? `${money(data.raised_30d)} in the last 30 days` : undefined} />
        <StatTile label="Waiting to be released" value={data ? money(Math.max(0, data.total_raised - data.released_total)) : '—'}
          hint={data ? `${money(data.released_total)} released so far` : undefined} />
      </div>

      <Card title="Needs your attention" padded={false}>
        {data && todo.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">You're all caught up.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {todo.map((t) => (
            <li key={t.text}>
              <button onClick={t.go} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50 cursor-pointer">
                <span>
                  <span className="inline-flex min-w-7 justify-center rounded-md bg-amber-100 text-amber-900 font-semibold tabular-nums px-1.5 mr-2">{t.n}</span>
                  {t.text}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid lg:grid-cols-2 gap-3">
        <Card title="New sign-ups · last 30 days">
          {data?.signups_30d ? (
            <BarChart
              label="New sign-ups per day"
              data={data.signups_30d.map((d) => ({ day: d.day, value: Number(d.count) }))}
              format={(n) => `${Math.round(n)} ${Math.round(n) === 1 ? 'person' : 'people'}`}
            />
          ) : <div className="h-40" />}
        </Card>
        <Card title="Money raised · last 30 days">
          {data?.donations_30d ? (
            <BarChart
              label="Money raised per day"
              data={data.donations_30d.map((d) => ({ day: d.day, value: Number(d.amount) }))}
              format={money}
            />
          ) : <div className="h-40" />}
        </Card>
      </div>

      {data && data.suspended_users > 0 && (
        <p className="text-xs text-slate-500">
          {data.suspended_users} suspended {data.suspended_users === 1 ? 'account' : 'accounts'}.{' '}
          <button className="underline cursor-pointer" onClick={() => onGo('users')}>View in Users</button>
        </p>
      )}
    </AdminPage>
  );
}
