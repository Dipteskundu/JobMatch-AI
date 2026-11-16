"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Attaches IntersectionObserver to a container ref and adds
 * the "visible" class to any child with class "reveal", "reveal-left",
 * "reveal-right", or "reveal-scale" when it enters the viewport.
 *
 * Usage:
 *   const containerRef = useScrollReveal();
 *   <section ref={containerRef}>
 *     <div className="reveal">...</div>
 *     <div className="reveal delay-200">...</div>
 *   </section>
 *
 * Optional stagger: when `stagger` (ms) is set, elements that enter the
 * viewport in the same scroll batch animate top-to-bottom in a cascade.
 * The delay is applied in JS (setTimeout) so hover transitions on the
 * same elements are never delayed.
 *
 *   const containerRef = useScrollReveal({ stagger: 90 });
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const stableOptions = useMemo(() => options ?? {}, [options]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    if (!targets.length) return;

    const { stagger = 0 } = stableOptions;
    const timers = [];

    const observer = new IntersectionObserver(
      (entries) => {
        // Stagger: cascade the batch from top of the viewport downwards.
        const batch = stagger
          ? [...entries].filter((e) => e.isIntersecting).sort(
              (a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top
            )
          : entries;

        let batchIndex = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const delay = stagger ? batchIndex++ * stagger : 0;
          if (delay > 0) {
            timers.push(setTimeout(() => entry.target.classList.add("visible"), delay));
          } else {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((t) => observer.observe(t));
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [stableOptions]);

  return ref;
}
