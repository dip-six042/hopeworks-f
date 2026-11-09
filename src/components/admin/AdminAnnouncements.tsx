import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { adminApi, shortDate, ROLE_LABELS, type AdminActivity } from './adminApi';
import { AdminPage, Button, Card, Select, Table } from './AdminUI';
import type { UserRole } from '../../types';

const AUDIENCES: { value: string; label: string }[] = [
  { value: '', label: 'Everyone' },
  ...(['donor', 'volunteer', 'entrepreneur', 'project_manager'] as UserRole[]).map((r) => ({ value: r, label: `${ROLE_LABELS[r]}s` })),
];

export function AdminAnnouncements() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<AdminActivity[] | null>(null);

  const loadHistory = async () => {
    try { setHistory(await adminApi.announcements()); } catch { setHistory([]); }
  };
  useEffect(() => { void loadHistory(); }, []);

  const canSend = title.trim().length >= 3 && message.trim().length >= 3;
  const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label ?? 'Everyone';

  const send = async () => {
    setSending(true);
    try {
      const { sent } = await adminApi.announce(title.trim(), message.trim(), audience);
      toast.success(`Sent to ${sent.toLocaleString()} ${sent === 1 ? 'person' : 'people'}.`);
      setTitle('');
      setMessage('');
      setConfirming(false);
      void loadHistory();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPage title="Announcements" description="Send a message that appears in people's notifications on HopeWorks.">
      <Card title="New announcement">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Send to</span>
            <Select label="Audience" value={audience} onChange={setAudience}>
              {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Title"
            aria-label="Title"
            className="w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Message"
            aria-label="Message"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{message.length}/2000 · Suspended accounts don't receive it. Email delivery comes once email sending is set up.</span>
            {confirming ? (
              <div className="flex gap-2">
                <Button onClick={() => setConfirming(false)}>Cancel</Button>
                <Button variant="primary" onClick={send} loading={sending}>Yes, send to {audienceLabel.toLowerCase()}</Button>
              </div>
            ) : (
              <Button variant="primary" disabled={!canSend} onClick={() => setConfirming(true)}>Send</Button>
            )}
          </div>
        </div>
      </Card>

      <Card title="Sent" padded={false}>
        <Table head={['Date', 'Title', 'Details']} loading={history === null} empty={history?.length === 0}>
          {history?.map((h) => (
            <tr key={h.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">{shortDate(h.timestamp)}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">{h.affectedEntityName}</td>
              <td className="px-4 py-2.5 text-slate-600">{h.rationale}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </AdminPage>
  );
}
