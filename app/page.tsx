"use client";
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ProjectId = "earth" | "fushenglu" | "reimburse" | "zhiwei";

type SourceRect = { x: number; y: number; w: number; h: number };

type Shard = {
  id: string;
  polygon: string;
  sourceRect: SourceRect;
  rest: {
    x: number;
    y: number;
    z: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
  };
  delay: number;
  node?: { x: number; y: number };
};

type Project = {
  id: ProjectId;
  title: string;
  year: string;
  tags: string[];
  sourceUrl: string;
  master: string;
  center: number;
  tint: string;
  nodes: { x: number; y: number; label: string }[];
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const segment = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));

const shards: Shard[] = [
  {
    id: "crown",
    polygon: "polygon(4% 9%, 83% 0, 100% 24%, 88% 94%, 19% 100%, 0 58%)",
    sourceRect: { x: 6, y: 7, w: 35, h: 33 },
    rest: { x: -43, y: -31, z: 150, rotateX: -12, rotateY: 18, rotateZ: -16 },
    delay: 0.02,
    node: { x: 35, y: 28 },
  },
  {
    id: "north",
    polygon: "polygon(8% 0, 94% 12%, 100% 73%, 69% 100%, 0 82%, 7% 29%)",
    sourceRect: { x: 39, y: 4, w: 29, h: 28 },
    rest: { x: 9, y: -48, z: -120, rotateX: 20, rotateY: -13, rotateZ: 11 },
    delay: 0.1,
  },
  {
    id: "east",
    polygon: "polygon(16% 4%, 100% 0, 91% 78%, 63% 100%, 0 84%, 8% 25%)",
    sourceRect: { x: 68, y: 9, w: 27, h: 34 },
    rest: { x: 48, y: -22, z: 230, rotateX: -16, rotateY: -22, rotateZ: 18 },
    delay: 0.06,
    node: { x: 76, y: 32 },
  },
  {
    id: "west",
    polygon: "polygon(0 19%, 27% 0, 100% 9%, 87% 92%, 46% 100%, 9% 73%)",
    sourceRect: { x: 10, y: 39, w: 29, h: 30 },
    rest: { x: -52, y: 3, z: -180, rotateX: 18, rotateY: 25, rotateZ: 9 },
    delay: 0.16,
  },
  {
    id: "heart",
    polygon: "polygon(7% 7%, 79% 0, 100% 23%, 91% 78%, 65% 100%, 12% 92%, 0 38%)",
    sourceRect: { x: 38, y: 31, w: 37, h: 37 },
    rest: { x: 4, y: 6, z: 390, rotateX: -8, rotateY: 10, rotateZ: -8 },
    delay: 0,
    node: { x: 57, y: 53 },
  },
  {
    id: "rim",
    polygon: "polygon(12% 0, 100% 17%, 86% 89%, 23% 100%, 0 62%, 5% 21%)",
    sourceRect: { x: 75, y: 41, w: 19, h: 31 },
    rest: { x: 53, y: 11, z: 40, rotateX: 12, rotateY: -28, rotateZ: -14 },
    delay: 0.19,
  },
  {
    id: "southwest",
    polygon: "polygon(0 22%, 31% 0, 100% 13%, 89% 83%, 55% 100%, 9% 74%)",
    sourceRect: { x: 17, y: 68, w: 29, h: 25 },
    rest: { x: -35, y: 42, z: 220, rotateX: -22, rotateY: 12, rotateZ: 19 },
    delay: 0.12,
    node: { x: 34, y: 80 },
  },
  {
    id: "south",
    polygon: "polygon(10% 0, 82% 5%, 100% 45%, 88% 100%, 17% 91%, 0 37%)",
    sourceRect: { x: 46, y: 68, w: 36, h: 27 },
    rest: { x: 19, y: 47, z: -160, rotateX: 19, rotateY: -15, rotateZ: -12 },
    delay: 0.21,
  },
  {
    id: "dust-left",
    polygon: "polygon(17% 0, 100% 18%, 74% 100%, 0 71%)",
    sourceRect: { x: 2, y: 64, w: 8, h: 12 },
    rest: { x: -66, y: 21, z: -310, rotateX: 31, rotateY: 24, rotateZ: 35 },
    delay: 0.25,
  },
  {
    id: "dust-right",
    polygon: "polygon(0 25%, 31% 0, 100% 14%, 82% 100%, 19% 80%)",
    sourceRect: { x: 88, y: 74, w: 8, h: 11 },
    rest: { x: 67, y: 39, z: 310, rotateX: -27, rotateY: -33, rotateZ: -29 },
    delay: 0.28,
  },
];

const projects: Project[] = [
  {
    id: "earth",
    title: "EARTH ONLINE",
    year: "2026",
    tags: ["THREE.JS", "LOCAL-FIRST", "EXPERIMENT"],
    sourceUrl: "https://github.com/Rain-dust/earth-online",
    master: "/rain-dust/masters/earth-master.webp",
    center: 0.345,
    tint: "18 45 68",
    nodes: [
      { x: 18, y: 23, label: "WORLD" },
      { x: 78, y: 28, label: "RUNTIME" },
      { x: 34, y: 78, label: "RECORD" },
      { x: 73, y: 69, label: "LOCAL" },
    ],
  },
  {
    id: "fushenglu",
    title: "浮生录",
    year: "2026",
    tags: ["WRITING", "MEMORY", "LOCAL-FIRST"],
    sourceUrl: "https://github.com/Rain-dust/fushenglu",
    master: "/rain-dust/masters/fushenglu-master.webp",
    center: 0.485,
    tint: "116 82 48",
    nodes: [
      { x: 20, y: 26, label: "TEXT" },
      { x: 76, y: 24, label: "MEMORY" },
      { x: 31, y: 78, label: "INK" },
      { x: 76, y: 72, label: "SEAL" },
    ],
  },
  {
    id: "reimburse",
    title: "CAMPUS REIMBURSE KIT",
    year: "2026",
    tags: ["DESKTOP TOOL", "AUTOMATION", "WORKFLOW"],
    sourceUrl: "https://github.com/Rain-dust/campus-reimburse-kit",
    master: "/rain-dust/masters/reimburse-master-placeholder.webp",
    center: 0.625,
    tint: "66 80 81",
    nodes: [
      { x: 19, y: 27, label: "IMPORT" },
      { x: 78, y: 29, label: "PARSE" },
      { x: 29, y: 78, label: "MATCH" },
      { x: 78, y: 72, label: "EXPORT" },
    ],
  },
  {
    id: "zhiwei",
    title: "知微",
    year: "2026",
    tags: ["AI-NATIVE", "DECISION", "INTERACTIVE"],
    sourceUrl: "https://github.com/Rain-dust/Zhi-Wei",
    master: "/rain-dust/masters/zhiwei-master.webp",
    center: 0.765,
    tint: "31 39 73",
    nodes: [
      { x: 18, y: 27, label: "SIGNAL" },
      { x: 78, y: 25, label: "EXPRESSION" },
      { x: 30, y: 78, label: "JUDGMENT" },
      { x: 76, y: 70, label: "DECISION" },
    ],
  },
];

const snapPoints = [0, 0.145, ...projects.map((project) => project.center), 0.875, 0.985];

function shardBackground(rect: SourceRect): CSSProperties {
  const x = rect.x / Math.max(1, 100 - rect.w);
  const y = rect.y / Math.max(1, 100 - rect.h);
  return {
    backgroundSize: `${(100 / rect.w) * 100}% ${(100 / rect.h) * 100}%`,
    backgroundPosition: `${x * 100}% ${y * 100}%`,
  };
}

function ProjectScene({
  project,
  progress,
}: {
  project: Project;
  progress: number;
}) {
  const start = project.center - 0.105;
  const end = project.center + 0.105;
  const local = segment(progress, start, end);
  const arrive = smooth(segment(local, 0.04, 0.45));
  const depart = smooth(segment(local, 0.61, 0.98));
  const assembled = arrive * (1 - depart);
  const visibility = smooth(segment(local, 0, 0.18)) * (1 - smooth(segment(local, 0.83, 1)));
  const titleReveal = smooth(segment(local, 0.36, 0.5)) * (1 - smooth(segment(local, 0.7, 0.9)));

  return (
    <section
      className="project-scene"
      data-project={project.id}
      aria-hidden={visibility < 0.05}
      style={
        {
          "--scene-opacity": visibility,
          "--title-opacity": titleReveal,
          "--scene-tint": project.tint,
        } as CSSProperties
      }
    >
      <div className="constellation-frame">
        <div className="orbit-rings" aria-hidden="true" />

        {shards.map((shard, index) => {
          const delayedArrive = smooth(segment(arrive, shard.delay, Math.min(1, shard.delay + 0.58)));
          const delayedDepart = smooth(segment(depart, shard.delay * 0.45, Math.min(1, 0.58 + shard.delay)));
          const focus = delayedArrive * (1 - delayedDepart);
          const exitDirection = index % 2 === 0 ? 1 : -1;
          const x = mix(shard.rest.x, 0, delayedArrive) + shard.rest.x * -0.82 * delayedDepart;
          const y = mix(shard.rest.y, 0, delayedArrive) + (shard.rest.y * 0.6 + exitDirection * 18) * delayedDepart;
          const z = mix(shard.rest.z, 0, delayedArrive) + -shard.rest.z * 0.75 * delayedDepart;
          const rotateX = mix(shard.rest.rotateX, 0, focus);
          const rotateY = mix(shard.rest.rotateY, 0, focus);
          const rotateZ =
            mix(shard.rest.rotateZ, 0, delayedArrive) +
            exitDirection * (14 + index * 1.7) * delayedDepart;
          const blur = Math.abs(z) / 220;

          return (
            <div
              className={`eidolon-shard shard-${shard.id}`}
              key={shard.id}
              style={
                {
                  left: `${shard.sourceRect.x}%`,
                  top: `${shard.sourceRect.y}%`,
                  width: `${shard.sourceRect.w}%`,
                  height: `${shard.sourceRect.h}%`,
                  clipPath: shard.polygon,
                  opacity: visibility * (0.34 + focus * 0.66),
                  filter: `blur(${blur.toFixed(2)}px) saturate(${0.72 + focus * 0.28})`,
                  transform: `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, ${z.toFixed(1)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg)`,
                  "--edge-intensity": 0.18 + assembled * 0.72,
                  "--shard-delay": `${shard.delay * 1.4}s`,
                } as CSSProperties
              }
            >
              <div
                className="master-sample"
                style={{
                  ...shardBackground(shard.sourceRect),
                  backgroundImage: `url(${project.master})`,
                }}
              />
              <i className="shard-light" aria-hidden="true" />
            </div>
          );
        })}

        <div
          className="constellation-lines"
          aria-hidden="true"
          style={{ opacity: titleReveal * 0.7 }}
        >
          <i className="line line-a" />
          <i className="line line-b" />
          <i className="line line-c" />
        </div>

        {project.nodes.map((node, index) => {
          const active = smooth(segment(local, 0.37 + index * 0.035, 0.48 + index * 0.035));
          return (
            <div
              className="constellation-node"
              key={node.label}
              style={
                {
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  opacity: visibility * active,
                  "--node-energy": active,
                } as CSSProperties
              }
            >
              <i />
              <span>{node.label}</span>
            </div>
          );
        })}
      </div>

      <div className="project-meta" style={{ opacity: titleReveal }}>
        <span>{project.year} / 0{projects.findIndex((item) => item.id === project.id) + 1}</span>
        <h2>{project.title}</h2>
        <ul>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div>
          <span aria-disabled="true">VIEW</span>
          <a href={project.sourceUrl} target="_blank" rel="noreferrer">SOURCE</a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const opening = 1 - smooth(segment(progress, 0.045, 0.185));
  const fracture = smooth(segment(progress, 0.11, 0.285)) * (1 - smooth(segment(progress, 0.27, 0.35)));
  const orbit = smooth(segment(progress, 0.815, 0.865)) * (1 - smooth(segment(progress, 0.93, 0.965)));
  const info = smooth(segment(progress, 0.935, 0.995));

  const activeProject = useMemo(
    () =>
      projects.reduce((closest, project) =>
        Math.abs(project.center - progress) < Math.abs(closest.center - progress)
          ? project
          : closest,
      projects[0]),
    [progress],
  );

  const scrollToProgress = useCallback((target: number, behavior: ScrollBehavior = "smooth") => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * target, behavior: reducedMotion ? "auto" : behavior });
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);

    let frame = 0;
    const readScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(clamp(window.scrollY / max));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(readScroll);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => {
        const current = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        if (current >= 0.27 && current <= 0.83) {
          const nearest = projects.reduce((best, project) =>
            Math.abs(project.center - current) < Math.abs(best - current) ? project.center : best,
          projects[0].center);
          if (Math.abs(nearest - current) < 0.055) scrollToProgress(nearest);
        }
      }, 170);
    };
    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      media.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, [scrollToProgress]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") return scrollToProgress(0);
      if (event.key === "End") return scrollToProgress(0.985);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const next = direction > 0
        ? snapPoints.find((point) => point > progress + 0.018)
        : [...snapPoints].reverse().find((point) => point < progress - 0.018);
      scrollToProgress(next ?? (direction > 0 ? 1 : 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress, scrollToProgress]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stageRef.current?.style.setProperty("--parallax-x", `${x * 16}px`);
    stageRef.current?.style.setProperty("--parallax-y", `${y * 12}px`);
    stageRef.current?.style.setProperty("--cursor-x", `${(x + 0.5) * 100}%`);
    stageRef.current?.style.setProperty("--cursor-y", `${(y + 0.5) * 100}%`);
  };

  return (
    <div className="scroll-track">
      <main
        ref={stageRef}
        className="cinematic-stage"
        data-active-project={activeProject.id}
        onPointerMove={handlePointerMove}
        style={
          {
            "--timeline-progress": progress,
            "--opening-opacity": opening,
            "--fracture-opacity": fracture,
            "--orbit-opacity": orbit,
            "--info-opacity": info,
          } as CSSProperties
        }
      >
        <a className="skip-link" href="#identity">跳到联系信息</a>

        <header className="stage-header">
          <button type="button" onClick={() => scrollToProgress(0)}>
            <span>RAIN_DUST</span>
            <strong>寻迹沐雨</strong>
          </button>
          <div className="timeline-index">
            <span>{String(Math.round(progress * 100)).padStart(2, "0")}</span>
            <i><b /></i>
            <span>100</span>
          </div>
        </header>

        <section className="opening-scene" aria-hidden={opening < 0.05}>
          <div className="opening-copy">
            <span>RAIN_DUST / 寻迹沐雨</span>
            <h1>于无声处，<br />拾取微光。</h1>
            <p>INDEPENDENT BUILDER / AI-NATIVE CREATOR</p>
          </div>
          <img
            className="opening-girl"
            src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
            alt=""
          />
          <i className="red-eye" aria-hidden="true" />
          {[1, 2, 3, 4, 5].map((strand) => (
            <i className={`hair-strand hair-${strand}`} key={strand} aria-hidden="true" />
          ))}
          <div className="cursor-reveal" aria-hidden="true" />
          <p className="scroll-cue">SCROLL TO WAKE <i /></p>
        </section>

        <div className="fracture-layer" aria-hidden="true">
          <i className="fracture fracture-a" />
          <i className="fracture fracture-b" />
          <i className="fracture fracture-c" />
          <i className="fracture fracture-d" />
        </div>

        <div className="project-universe">
          {projects.map((project) => (
            <ProjectScene project={project} progress={progress} key={project.id} />
          ))}
        </div>

        <section className="all-works" aria-hidden={orbit < 0.05}>
          <div className="orbit-core">
            <span>ALL WORKS / ORBIT</span>
            <i />
          </div>
          {projects.map((project, index) => {
            const rect = shards[index === 0 ? 4 : index + 1].sourceRect;
            return (
              <button
                type="button"
                className={`orbit-work orbit-work-${index + 1}`}
                key={project.id}
                onClick={() => scrollToProgress(project.center)}
                aria-label={`聚焦 ${project.title}`}
              >
                <i
                  style={{
                    ...shardBackground(rect),
                    backgroundImage: `url(${project.master})`,
                  }}
                />
                <span>{project.title}</span>
              </button>
            );
          })}
        </section>

        <section className="identity-layer" id="identity" aria-hidden={info < 0.05}>
          <img
            src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
            alt=""
          />
          <div>
            <span>寻迹沐雨</span>
            <strong>RAIN_DUST</strong>
            <span>INTP</span>
            <span>INDEPENDENT BUILDER</span>
            <span>AI-NATIVE CREATOR</span>
          </div>
          <nav aria-label="联系方式">
            <a href="https://github.com/Rain-dust" target="_blank" rel="noreferrer">GITHUB</a>
            <span aria-disabled="true">EMAIL</span>
          </nav>
          <i className="identity-eye" aria-hidden="true" />
        </section>

        <div className="stage-footer">
          <span>SCROLL / ARROW KEYS</span>
          <span>{activeProject.title}</span>
          <button type="button" onClick={() => scrollToProgress(0.985)}>INFO</button>
        </div>
      </main>
    </div>
  );
}
