import { apiFetch } from '../../lib/apiClient';
import { supabase } from '../../lib/supabase';
import type { UserRole, Project, Donation, VolunteerApplication, UserProfile } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AdminOverview {
  total_users: number;
  new_users_7d: number;
  suspended_users: number;
  live_campaigns: number;
  pending_campaigns: number;
  paused_campaigns: number;
  total_raised: number;
  raised_30d: number;
  released_total: number;
  ids_to_check: number;
  campaigns_without_pm: number;
  milestones_waiting: number;
  signups_30d: { day: string; count: number }[] | null;
  donations_30d: { day: string; amount: number }[] | null;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  location?: string;
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  isSuspended: boolean;
  suspendedReason?: string;
  createdAt: string;
  lastSignInAt?: string;
  campaignsCount: number;
  donationsCount: number;
  donationsTotal: number;
}

export interface AdminUserList {
  total: number;
  page: number;
  pageSize: number;
  users: AdminUserRow[];
}

export interface AdminActivity {
  id: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  affectedEntityName: string;
  rationale?: string;
  timestamp: string;
}

export interface AdminUserDetail {
  profile: UserProfile & { isSuspended?: boolean; suspendedReason?: string };
  lastSignInAt?: string;
  emailConfirmed: boolean;
  campaigns: Project[];
  donations: (Donation & { status?: string; currency?: string })[];
  applications: VolunteerApplication[];
  activity: AdminActivity[];
}

export interface MonthlyRow {
  month: string;
  newUsers: number;
  newCampaigns: number;
  donations: number;
  raised: number;
  fees: number;
  released: number;
}

export const adminApi = {
  overview: () => apiFetch<AdminOverview>('/api/admin/overview'),
  users: (q: { search?: string; role?: string; status?: string; sort?: string; page?: number; pageSize?: number }) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
    });
    return apiFetch<AdminUserList>(`/api/admin/users?${params.toString()}`);
  },
  user: (id: string) => apiFetch<AdminUserDetail>(`/api/admin/users/${id}`),
  suspend: (id: string, reason: string) =>
    apiFetch<{ paused: number }>(`/api/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  unsuspend: (id: string) => apiFetch(`/api/admin/users/${id}/unsuspend`, { method: 'POST' }),
  setRoles: (id: string, roles: UserRole[]) =>
    apiFetch<UserProfile>(`/api/users/${id}/roles`, { method: 'PATCH', body: JSON.stringify({ roles }) }),
  pauseCampaign: (id: string, reason: string) =>
    apiFetch(`/api/admin/campaigns/${id}/pause`, { method: 'POST', body: JSON.stringify({ reason }) }),
  resumeCampaign: (id: string) => apiFetch(`/api/admin/campaigns/${id}/resume`, { method: 'POST' }),
  announcements: () => apiFetch<AdminActivity[]>('/api/admin/announcements'),
  announce: (title: string, message: string, role: string) =>
    apiFetch<{ sent: number }>('/api/admin/announcements', { method: 'POST', body: JSON.stringify({ title, message, role: role || null }) }),
  monthly: () => apiFetch<MonthlyRow[]>('/api/admin/reports/monthly'),
};

/** Download a CSV export (needs the auth header, so it can't be a plain link). */
export async function downloadExport(kind: 'users' | 'campaigns' | 'donations') {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API_URL}/api/admin/exports/${kind}`, {
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Export failed');
  }
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || `hopeworks-${kind}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  entrepreneur: 'Project Owner',
  donor: 'Donor',
  volunteer: 'Volunteer',
};

export function money(n: number) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

export function shortDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(iso?: string) {
  if (!iso) return 'Never';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return shortDate(iso);
}
