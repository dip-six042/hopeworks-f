import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PillButton } from './PillButton';
import type { UserRole } from '../types';

/** Roles that get signed out automatically after a period of inactivity. */
const IDLE_ROLES: UserRole[] = ['admin'];
/** Minutes of no activity before signing out. */
const IDLE_MINUTES = (() => {
  const v = Number(import.meta.env.VITE_ADMIN_IDLE_MINUTES);
  return Number.isFinite(v) && v > 0 ? v : 10;
})();
/** Seconds of warning shown before signing out. */
const WARNING_SECONDS = 60;

const IDLE_MS = IDLE_MINUTES * 60_000;
const WARNING_MS = Math.min(WARNING_SECONDS * 1000, IDLE_MS / 2);
const ACTIVITY_KEY = 'hw_last_activity';
const LOGOUT_KEY = 'hw_idle_logout';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;

function readLastActivity(): number {
  try {
    const v = Number(localStorage.getItem(ACTIVITY_KEY));
    return Number.isFinite(v) && v > 0 ? v : Date.now();
  } catch {
    return Date.now();
  }
}

function writeLastActivity(ts: number) {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(ts));
  } catch {
    /* storage unavailable: this tab still tracks its own activity */
  }
}

interface IdleLogoutGuardProps {
  /** Called after the user has been signed out for inactivity. */
  onSignedOut: () => void;
}

/**
 * Signs out admins after IDLE_MINUTES without activity, with a WARNING_SECONDS countdown first.
 * Activity in any open tab keeps every tab signed in; a sign-out in one tab signs out all tabs.
 */
export function IdleLogoutGuard({ onSignedOut }: IdleLogoutGuardProps) {
  const { user, logout } = useAuth();
  const enabled = !!user && user.roles.some((r) => IDLE_ROLES.includes(r));

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const secondsLeftRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  secondsLeftRef.current = secondsLeft;
  const lastLocalWrite = useRef(0);
  const signingOut = useRef(false);

  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    setSecondsLeft(null);
    try {
      localStorage.setItem(LOGOUT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    await logout();
    onSignedOut();
  }, [logout, onSignedOut]);

  const markActive = useCallback(() => {
    const now = Date.now();
    // Throttle storage writes to once every 5s.
    if (now - lastLocalWrite.current > 5000) {
      lastLocalWrite.current = now;
      writeLastActivity(now);
    }
  }, []);

  const stayActive = useCallback(() => {
    lastLocalWrite.current = 0;
    markActive();
    setSecondsLeft(null);
  }, [markActive]);

  useEffect(() => {
    if (!enabled) {
      setSecondsLeft(null);
      return;
    }
    signingOut.current = false;
    writeLastActivity(Date.now());

    // While the warning is up, ordinary mouse movement shouldn't silently dismiss it:
    // only the "Stay signed in" button (or keyboard/click) counts.
    const onActivity = (e: Event) => {
      // Clicks on the warning's own buttons are handled by those buttons.
      if (dialogRef.current && e.target instanceof Node && dialogRef.current.contains(e.target)) return;
      if (secondsLeftRef.current !== null && (e.type === 'mousemove' || e.type === 'scroll' || e.type === 'wheel')) return;
      markActive();
      if (secondsLeftRef.current !== null) setSecondsLeft(null);
    };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOGOUT_KEY && e.newValue) void signOut();
    };
    window.addEventListener('storage', onStorage);

    const tick = setInterval(() => {
      const idleFor = Date.now() - readLastActivity();
      if (idleFor >= IDLE_MS) {
        void signOut();
      } else if (idleFor >= IDLE_MS - WARNING_MS) {
        setSecondsLeft(Math.ceil((IDLE_MS - idleFor) / 1000));
      } else if (secondsLeftRef.current !== null) {
        setSecondsLeft(null); // activity happened in another tab
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener('storage', onStorage);
      clearInterval(tick);
    };
  }, [enabled, markActive, signOut]);

  if (!enabled || secondsLeft === null) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      aria-describedby="idle-desc"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4 text-center">
        <div className="mx-auto w-11 h-11 rounded-full bg-orange-50 text-[#B24724] flex items-center justify-center">
          <Clock className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 id="idle-title" className="font-serif text-lg font-semibold text-slate-900">Still there?</h2>
          <p id="idle-desc" className="text-sm text-slate-600">
            For security, admins are signed out after {IDLE_MINUTES} {IDLE_MINUTES === 1 ? 'minute' : 'minutes'} of inactivity. You'll be signed out in{' '}
            <span className="font-semibold tabular-nums text-slate-900">{secondsLeft}s</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <PillButton type="button" variant="muted" caps={false} onClick={() => void signOut()} className="flex-1 py-2.5 text-xs">
            Sign out now
          </PillButton>
          <PillButton type="button" variant="success" caps={false} onClick={stayActive} className="flex-1 py-2.5 text-xs">
            Stay signed in
          </PillButton>
        </div>
      </div>
    </div>
  );
}
