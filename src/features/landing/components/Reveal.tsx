'use client';

import { useEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';

/**
 * Scroll reveal built on one shared IntersectionObserver and two CSS classes.
 *
 * The previous landing page pulled in `motion` for its hero and navbar; the new
 * sections need none of it. All animation is opacity / transform / clip-path,
 * driven by a `data-shown` attribute, so it stays off the main thread and
 * costs a few hundred bytes instead of a library.
 */

type Entry = { el: Element };

let observer: IntersectionObserver | null = null;
const pending = new Set<Element>();

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-shown', 'true');
        observer?.unobserve(entry.target);
        pending.delete(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );
  return observer;
}

function observe({ el }: Entry) {
  const io = getObserver();
  if (!io) {
    el.setAttribute('data-shown', 'true');
    return () => {};
  }
  pending.add(el);
  io.observe(el);
  return () => {
    io.unobserve(el);
    pending.delete(el);
  };
}

export function Reveal({
  as: Tag = 'div',
  variant = 'rise',
  delay = 0,
  className = '',
  children,
}: {
  as?: ElementType;
  variant?: 'rise' | 'wipe';
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observe({ el });
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown="false"
      style={delay ? ({ '--ed-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={`${variant === 'wipe' ? 'ed-wipe' : 'ed-reveal'} ${className}`}
    >
      {/* Wipes clip an inner element so the observed box stays unclipped —
          see the note beside .ed-wipe-inner in globals.css. */}
      {variant === 'wipe' ? <span className="ed-wipe-inner">{children}</span> : children}
    </Tag>
  );
}
