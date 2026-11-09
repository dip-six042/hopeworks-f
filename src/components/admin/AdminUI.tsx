import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X } from 'lucide-react';

/** Shared building blocks so every admin page looks the same: plain, dense, readable. */

export function AdminPage({ title, description, actions, children }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, actions, children, className = '', padded = true }: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`bg-white border border-slate-200 rounded-xl ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

export function StatTile({ label, value, hint, tone = 'default', onClick }: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'attention';
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`text-left bg-white border rounded-xl p-4 transition-colors ${
        tone === 'attention' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
      } ${onClick ? 'hover:border-slate-400 cursor-pointer' : ''}`}
    >
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </Comp>
  );
}

export function Button({ children, onClick, variant = 'secondary', disabled, loading, type = 'button', className = '', title }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  title?: string;
}) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700 border-slate-900',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300',
    danger: 'bg-white text-red-700 hover:bg-red-50 border-red-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-transparent',
  }[variant];
  return (
    <motion.button
      type={type}
      title={title}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${styles} ${className}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </motion.button>
  );
}

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'green' | 'amber' | 'red' | 'blue' }) {
  const t = {
    gray: 'bg-slate-100 text-slate-700',
    green: 'bg-[#ECFDF5] text-[#047857]',
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-sky-50 text-sky-700',
  }[tone];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${t}`}>{children}</span>;
}

export function Table({ head, children, empty, loading }: {
  head: React.ReactNode[];
  children: React.ReactNode;
  empty?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            {head.map((h, i) => (
              <th key={i} className="text-left font-medium text-xs text-slate-500 px-4 py-2.5 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {!loading && empty && <div className="py-10 text-center text-sm text-slate-500">Nothing to show.</div>}
    </div>
  );
}

export function Select({ value, onChange, children, label }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {children}
      </select>
    </label>
  );
}

/** Right-hand slide-over panel. */
export function Drawer({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-slate-900/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 truncate">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5" data-lenis-prevent>{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Small modal asking for a reason before a serious action. */
export function ReasonDialog({ open, title, message, confirmLabel, danger, onCancel, onConfirm, busy }: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState('');
  React.useEffect(() => { if (open) setReason(''); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-slate-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
          <motion.div
            className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-5 space-y-4"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-1">{message}</p>
            </div>
            <textarea
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (saved in the activity log)"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={onCancel}>Cancel</Button>
              <Button
                variant={danger ? 'danger' : 'primary'}
                loading={busy}
                disabled={reason.trim().length < 3}
                onClick={() => onConfirm(reason.trim())}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
