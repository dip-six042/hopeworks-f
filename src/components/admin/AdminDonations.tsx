import React, { useCallback, useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminApi, downloadExport, money, shortDate, type AdminDonationList } from './adminApi';
import { AdminPage, Badge, Button, Card, Select, Table } from './AdminUI';

const PAGE_SIZE = 25;

function statusBadge(s: string) {
  if (s === 'paid') return <Badge tone="green">Paid</Badge>;
  if (s === 'pending') return <Badge tone="amber">Pending</Badge>;
  return <Badge tone="red">Failed</Badge>;
}

export function AdminDonations() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminDonationList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.donations({ search: debounced, status, page, pageSize: PAGE_SIZE }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [debounced, status, page]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const from = data && data.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = data ? Math.min(page * PAGE_SIZE, data.total) : 0;

  const exportCsv = async () => {
    setExporting(true);
    try { await downloadExport('donations'); } catch (e) { toast.error((e as Error).message); } finally { setExporting(false); }
  };

  return (
    <AdminPage
      title="Donations"
      description={data ? `${data.counts.paid} paid · ${data.counts.pending} pending · ${data.counts.failed} failed` : 'Every donation, including ones that are still pending or failed.'}
      actions={<Button onClick={exportCsv} loading={exporting}><Download className="h-3.5 w-3.5" /> Export CSV</Button>}
    >
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor, campaign or payment reference"
              aria-label="Search donations"
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <Select label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
            <option value="">Any status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </div>

        {error && <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

        <Table
          head={['Date', 'Donor', 'Campaign', 'Amount', 'Fee', 'Status', 'Payment reference']}
          loading={loading && !data}
          empty={!loading && data?.donations.length === 0}
        >
          {data?.donations.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">{shortDate(d.createdAt)}</td>
              <td className="px-4 py-2.5">
                <div className="text-slate-900">{d.donorName}</div>
                {d.isAnonymous && <div className="text-xs text-slate-400">Shown publicly as anonymous</div>}
              </td>
              <td className="px-4 py-2.5 text-slate-700 max-w-[260px] truncate">{d.projectName}</td>
              <td className="px-4 py-2.5 tabular-nums whitespace-nowrap font-medium">{money(d.amount)}{d.currency ? <span className="text-xs text-slate-400 ml-1">{d.currency}</span> : null}</td>
              <td className="px-4 py-2.5 tabular-nums text-slate-600">{d.fee != null ? money(d.fee) : '—'}</td>
              <td className="px-4 py-2.5">{statusBadge(d.status)}</td>
              <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{d.paymentReference ?? '—'}</td>
            </tr>
          ))}
        </Table>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
          <span>{data ? `${from.toLocaleString()}–${to.toLocaleString()} of ${data.total.toLocaleString()}` : ''}</span>
          <div className="flex items-center gap-2">
            <Button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="tabular-nums">Page {page} of {totalPages}</span>
            <Button disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      <p className="text-xs text-slate-500">
        Refunds and payouts to campaign owners are done in the Kora dashboard for now.
      </p>
    </AdminPage>
  );
}
