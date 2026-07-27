"use client";
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EARTH_PROJECT, RELIC_TOPOLOGY_SEED } from "./relic-topology";

const NightRelicCanvas = lazy(() =>
  import("./night-relic-canvas").then((module) => ({
    default: module.NightRelicCanvas,
  })),
);

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const segment = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));

const SNAP_POINTS = [0, 0.14, 0.25, 0.34, 0.405, 0.438, 0.462, 0.495];

const PHASES = [
  { start: 0, label: "DAYLIGHT" },
  { start: 0.14, label: "EROSION" },
  { start: 0.3, label: "DESCENT" },
  { start: 0.4, label: "EARTH / SUMMON" },
  { start: 0.438, label: "EARTH / ASSEMBLED" },
  { start: 0.481, label: "EARTH / COLLAPSE" },
];

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  const daylight = 1 - smooth(segment(progress, 0.14, 0.3));
  const erosion = smooth(segment(progress, 0.14, 0.3));
  const descent = smooth(segment(progress, 0.3, 0.4));
  const earth = segment(progress, 0.4, 0.5);
  const earthPresence =
    smooth(segment(earth, 0.04, 0.36)) *
    (1 - smooth(segment(earth, 0.86, 1)));
  const assembled =
    smooth(segment(earth, 0.38, 0.57)) *
    (1 - smooth(segment(earth, 0.79, 0.96)));
  const phase =
    [...PHASES].reverse().find((item) => progress >= item.start)?.label ??
    PHASES[0].label;

  const scrollToPhase = useCallback(
    (phaseProgress: number, behavior: ScrollBehavior = "smooth") => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const physicalProgress = clamp(phaseProgress / 0.5);
      window.scrollTo({
        top: max * physicalProgress,
        behavior: reducedMotion ? "auto" : behavior,
      });
    },
    [reducedMotion],
  );

  const handleFallback = useCallback(() => setWebglFallback(true), []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);

    let frame = 0;
    const readScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const next = clamp((window.scrollY / max) * 0.5, 0, 0.5);
      progressRef.current = next;
      setProgress(next);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(readScroll);
    };

    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      media.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        ![
          "ArrowDown",
          "ArrowRight",
          "ArrowUp",
          "ArrowLeft",
          "Home",
          "End",
        ].includes(event.key)
      ) {
        return;
      }
      event.preventDefault();
      if (event.key === "Home") return scrollToPhase(0);
      if (event.key === "End") return scrollToPhase(0.495);
      const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const next = forward
        ? SNAP_POINTS.find((point) => point > progress + 0.008)
        : [...SNAP_POINTS]
            .reverse()
            .find((point) => point < progress - 0.008);
      scrollToPhase(next ?? (forward ? 0.495 : 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress, scrollToPhase]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stageRef.current?.style.setProperty("--cursor-x", `${(x + 0.5) * 100}%`);
    stageRef.current?.style.setProperty("--cursor-y", `${(y + 0.5) * 100}%`);
    stageRef.current?.style.setProperty("--parallax-x", `${x * 12}px`);
    stageRef.current?.style.setProperty("--parallax-y", `${y * 9}px`);
  };

  return (
    <div className="scroll-track">
      <main
        ref={stageRef}
        className="cinematic-stage"
        data-phase={phase}
        data-webgl-fallback={webglFallback}
        onPointerMove={handlePointerMove}
        style={
          {
            "--progress": progress / 0.5,
            "--daylight": daylight,
            "--erosion": erosion,
            "--descent": descent,
            "--earth-presence": earthPresence,
            "--assembled": assembled,
          } as CSSProperties
        }
      >
        <a className="skip-link" href="#earth-project">
          跳到 Earth 项目信息
        </a>

        {!webglFallback && (
          <Suspense fallback={null}>
            <NightRelicCanvas
              progressRef={progressRef}
              reducedMotion={reducedMotion}
              onFallback={handleFallback}
            />
          </Suspense>
        )}

        {webglFallback && (
          <div className="relic-fallback" aria-hidden="true">
            <img src={EARTH_PROJECT.masterArtwork} alt="" />
          </div>
        )}

        <div className="night-atmosphere" aria-hidden="true" />

        <header className="stage-header">
          <button type="button" onClick={() => scrollToPhase(0)}>
            <span>RAIN_DUST</span>
            <strong>寻辰沐雨</strong>
          </button>
          <div
            className="timeline-index"
            aria-label={`Phase A ${Math.round(progress * 200)}%`}
          >
            <span>00</span>
            <i><b /></i>
            <span>50</span>
          </div>
        </header>

        <section className="daylight-scene" aria-hidden={daylight < 0.04}>
          <div className="daylight-copy">
            <span>DAY MASK / NIGHT SELF</span>
            <h1>于无声处，<br />拾取微光。</h1>
            <p>INDEPENDENT BUILDER / AI-NATIVE CREATOR</p>
          </div>
          <img
            className="daylight-girl"
            src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
            alt=""
          />
          <i className="red-eye" aria-hidden="true" />
          <div className="cursor-reveal" aria-hidden="true" />
          <div className="hair-field" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="scroll-cue">SCROLL TO ERODE <i /></p>
        </section>

        <div className="erosion-overlay" aria-hidden="true">
          <i className="crack crack-a" />
          <i className="crack crack-b" />
          <i className="crack crack-c" />
          <i className="crack crack-d" />
          <span>THE SURFACE REMEMBERS</span>
        </div>

        <section className="descent-copy" aria-hidden={descent < 0.05}>
          <span>DESCENT / 03</span>
          <p>THE DAYLIGHT SHELL<br />IS NO LONGER ENOUGH.</p>
        </section>

        <section
          id="earth-project"
          className="earth-meta"
          aria-hidden={earthPresence < 0.05}
        >
          <span>{EARTH_PROJECT.year} / RELIC 01</span>
          <h2>{EARTH_PROJECT.title}</h2>
          <ul>
            {EARTH_PROJECT.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <div>
            <span aria-disabled="true">VIEW / SOON</span>
            <a href={EARTH_PROJECT.sourceUrl} target="_blank" rel="noreferrer">
              SOURCE
            </a>
          </div>
        </section>

        <div className="node-labels" aria-hidden={assembled < 0.06}>
          {EARTH_PROJECT.nodeLabels.map((label, index) => (
            <span className={`node-label node-label-${index + 1}`} key={label}>
              {label}
            </span>
          ))}
        </div>

        <aside className="phase-readout" aria-live="polite">
          <span>{phase}</span>
          <small>
            {String(Math.round(progress * 200)).padStart(2, "0")} / 100
          </small>
        </aside>

        <nav className="motion-controls" aria-label="场景切换">
          <button type="button" onClick={() => scrollToPhase(0)}>DAY</button>
          <button type="button" onClick={() => scrollToPhase(0.445)}>EARTH</button>
        </nav>

        <footer className="stage-footer">
          <span>SCROLL / ARROW KEYS</span>
          <span>SEED {RELIC_TOPOLOGY_SEED}</span>
          <button type="button" onClick={() => scrollToPhase(0.495)}>
            COLLAPSE
          </button>
        </footer>
      </main>
    </div>
  );
}
