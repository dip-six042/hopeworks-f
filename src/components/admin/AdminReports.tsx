import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminApi, downloadExport, money, type MonthlyRow } from './adminApi';
import { AdminPage, Button, Card, Table } from './AdminUI';

const EXPORTS = [
  { kind: 'users' as const, title: 'Users', text: 'Everyone registered, with roles, ID status and join date.' },
  { kind: 'campaigns' as const, title: 'Campaigns', text: 'Every campaign with owner, status, goal and amount raised.' },
  { kind: 'donations' as const, title: 'Donations', text: 'Every donation with amount, fee, status and payment reference.' },
];

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function AdminReports() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [rows, setRows] = useState<MonthlyRow[] | null>(null);

  useEffect(() => {
    adminApi.monthly().then(setRows).catch((e) => { toast.error((e as Error).message); setRows([]); });
  }, [toast]);

  const download = async (kind: 'users' | 'campaigns' | 'donations') => {
    setBusy(kind);
    try { await downloadExport(kind); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };

  const totals = rows?.reduce(
    (t, r) => ({ newUsers: t.newUsers + r.newUsers, newCampaigns: t.newCampaigns + r.newCampaigns, donations: t.donations + r.donations, raised: t.raised + r.raised, fees: t.fees + r.fees, released: t.released + r.released }),
    { newUsers: 0, newCampaigns: 0, donations: 0, raised: 0, fees: 0, released: 0 }
  );

  return (
    <AdminPage title="Reports" description="Download your data or see month-by-month totals (e.g. for your accountant).">
      <div className="grid md:grid-cols-3 gap-3">
        {EXPORTS.map((e) => (
          <React.Fragment key={e.kind}><Card>
            <div className="space-y-3">
              <div>
                <div className="font-medium text-slate-900">{e.title}</div>
                <p className="text-xs text-slate-500 mt-0.5">{e.text}</p>
              </div>
              <Button onClick={() => download(e.kind)} loading={busy === e.kind}><Download className="h-3.5 w-3.5" /> Download CSV</Button>
            </div>
          </Card></React.Fragment>
        ))}
      </div>

      <Card title="Monthly summary · last 12 months" padded={false}>
        <Table
          head={['Month', 'New users', 'New campaigns', 'Donations', 'Raised', 'Fees', 'Released']}
          loading={rows === null}
          empty={rows?.length === 0}
        >
          {rows?.map((r) => (
            <tr key={r.month}>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-900">{monthLabel(r.month)}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.newUsers}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.newCampaigns}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.donations}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(r.raised)}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(r.fees)}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(r.released)}</td>
            </tr>
          ))}
          {totals && rows && rows.length > 0 && (
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-2.5">Total</td>
              <td className="px-4 py-2.5 tabular-nums">{totals.newUsers}</td>
              <td className="px-4 py-2.5 tabular-nums">{totals.newCampaigns}</td>
              <td className="px-4 py-2.5 tabular-nums">{totals.donations}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(totals.raised)}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(totals.fees)}</td>
              <td className="px-4 py-2.5 tabular-nums">{money(totals.released)}</td>
            </tr>
          )}
        </Table>
      </Card>
    </AdminPage>
  );
}
