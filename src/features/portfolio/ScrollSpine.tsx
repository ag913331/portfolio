"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollSpine.module.css";

/**
 * A decorative curved line that threads down the page behind the content, with a
 * glowing dot that follows the scroll. The path sweeps from the left edge to the
 * right and back, crossing the page side-to-side roughly once per section. The
 * dot is placed along it via getPointAtLength(), anchored to the viewport center
 * while the trail fills behind it.
 */
export function ScrollSpine() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const railRef = useRef<SVGPathElement | null>(null);
  const trailRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const rail = railRef.current;
    const trail = trailRef.current;
    const dot = dotRef.current;
    const page = svg?.parentElement;
    if (!svg || !rail || !trail || !dot || !page) return;

    let length = 0;
    let pageHeight = 0;

    // Full-width weave: starts at the left edge, sweeps to the right edge and back,
    // crossing side-to-side about once per section.
    const buildPath = (w: number, h: number) => {
      const margin = Math.max(40, w * 0.06);
      const left = margin;
      const right = w - margin;
      const waves = Math.max(2, Math.round(h / 560));
      const seg = h / waves;
      let d = `M ${left} 0`;
      let x = left;
      for (let i = 0; i < waves; i++) {
        const y0 = i * seg;
        const y1 = (i + 1) * seg;
        const next = x === left ? right : left;
        d += ` C ${x} ${(y0 + seg * 0.5).toFixed(1)}, ${next} ${(y1 - seg * 0.5).toFixed(1)}, ${next} ${y1.toFixed(1)}`;
        x = next;
      }
      return d;
    };

    const update = () => {
      if (!length || !pageHeight) return;
      // Overall scroll progress: 0 at the top, 1 when fully scrolled to the bottom,
      // so the dot travels the entire path down the page.
      const max = pageHeight - window.innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      const len = t * length;
      trail.style.strokeDasharray = `${len} ${length}`;
      const p = trail.getPointAtLength(len);
      dot.setAttribute("cx", String(p.x));
      dot.setAttribute("cy", String(p.y));
    };

    const measure = () => {
      const w = page.clientWidth;
      // offsetHeight (not scrollHeight): the spine's own absolutely-positioned SVG would
      // otherwise inflate scrollHeight, making the path longer than the page can scroll.
      pageHeight = page.offsetHeight;
      const d = buildPath(w, pageHeight);
      rail.setAttribute("d", d);
      trail.setAttribute("d", d);
      svg.setAttribute("viewBox", `0 0 ${w} ${pageHeight}`);
      svg.style.height = `${pageHeight}px`;
      length = trail.getTotalLength();
      update();
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(page);

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg ref={svgRef} className={styles.spine} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="spineGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path ref={railRef} className={styles.rail} fill="none" />
      <path ref={trailRef} className={styles.trail} fill="none" filter="url(#spineGlow)" />
      <circle ref={dotRef} className={styles.dot} r="5" filter="url(#spineGlow)" />
    </svg>
  );
}
