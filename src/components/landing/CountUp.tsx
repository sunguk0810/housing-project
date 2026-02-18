"use client";

import { useRef, useEffect, useCallback } from "react";

interface CountUpProps {
  target: number;
  suffix?: string;
  /** Duration in ms (default 800) */
  duration?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({ target, suffix = "", duration = 800 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  const updateText = useCallback(
    (value: number) => {
      const el = ref.current;
      if (el) el.textContent = `${value.toLocaleString()}${suffix}`;
    },
    [suffix],
  );

  const animate = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      updateText(target);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      updateText(Math.round(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration, updateText]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <span ref={ref}>
      0{suffix}
    </span>
  );
}
