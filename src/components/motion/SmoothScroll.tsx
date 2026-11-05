import { useEffect } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Smooth (eased) wheel scrolling for long public pages.
 * Off when the visitor prefers reduced motion, and never applied inside dialogs,
 * dropdowns or other scrollable boxes (they keep normal scrolling).
 */
export function SmoothScroll({ enabled }: { enabled: boolean }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      // Touch devices already scroll smoothly; leave them native.
      syncTouch: false,
      prevent: (node) =>
        !!node.closest('[role="dialog"], [role="alertdialog"], [data-lenis-prevent], .overflow-y-auto, .overflow-auto, select, textarea'),
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled, reducedMotion]);

  return null;
}

/** Thin bar along the top of the page showing how far you've scrolled. */
export function ScrollProgress({ show }: { show: boolean }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  if (!show) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#B24724] origin-left z-[60] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
