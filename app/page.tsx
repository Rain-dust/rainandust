"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PortfolioState = "opening" | "workspace" | "project-focus" | "info";
type ProjectId = "earth" | "fushenglu" | "reimburse" | "zhiwei";
type ShardKind = "image" | "receipt" | "amount" | "grid" | "folder" | "order";

type Shard = {
  id: string;
  image?: string;
  kind: ShardKind;
  content?: string;
  clipPath: string;
  objectPosition?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  activeX: number;
  activeY: number;
  focusX: number;
  focusY: number;
  depth: 1 | 2 | 3;
};

type Project = {
  id: ProjectId;
  title: string;
  year: string;
  tags: string[];
  definition: string;
  sourceUrl: string;
  demoUrl?: string;
  labelPosition: string;
  shards: Shard[];
};

const projects: Project[] = [
  {
    id: "earth",
    title: "EARTH ONLINE",
    year: "2026",
    tags: ["THREE.JS", "LOCAL-FIRST", "EXPERIMENT"],
    definition: "A quiet world that keeps running after you leave.",
    sourceUrl: "https://github.com/Rain-dust/earth-online",
    labelPosition: "label-earth",
    shards: [
      { id: "earth-arc", kind: "image", image: "/rain-dust/fragments/earth-globe.webp", clipPath: "polygon(7% 5%, 88% 0, 100% 38%, 74% 100%, 18% 86%, 0 42%)", x: 61, y: 10, width: 18, height: 25, rotate: 5, activeX: -2, activeY: 4, focusX: -10, focusY: 12, depth: 2 },
      { id: "earth-night", kind: "image", image: "/rain-dust/source/earth-online-current.webp", clipPath: "polygon(13% 0, 100% 9%, 86% 91%, 29% 100%, 0 55%)", objectPosition: "76% 56%", x: 76, y: 31, width: 11, height: 17, rotate: -7, activeX: -6, activeY: 1, focusX: -18, focusY: 3, depth: 3 },
      { id: "earth-orbit", kind: "image", image: "/rain-dust/fragments/earth-orbits.webp", clipPath: "polygon(0 31%, 28% 0, 100% 17%, 91% 72%, 55% 100%, 8% 81%)", x: 48, y: 48, width: 17, height: 13, rotate: -4, activeX: 8, activeY: -8, focusX: 15, focusY: -18, depth: 1 },
      { id: "earth-signal", kind: "image", image: "/rain-dust/fragments/earth-status.webp", clipPath: "polygon(8% 12%, 92% 0, 100% 69%, 76% 100%, 0 81%)", x: 84, y: 60, width: 8, height: 10, rotate: 8, activeX: -10, activeY: -4, focusX: -23, focusY: -14, depth: 2 },
      { id: "earth-lights", kind: "image", image: "/rain-dust/source/earth-online-current.webp", clipPath: "polygon(26% 0, 100% 21%, 82% 100%, 0 71%, 9% 19%)", objectPosition: "43% 67%", x: 55, y: 72, width: 7, height: 11, rotate: 12, activeX: 13, activeY: -8, focusX: 22, focusY: -25, depth: 3 },
    ],
  },
  {
    id: "fushenglu",
    title: "浮生录",
    year: "2026",
    tags: ["WRITING", "MEMORY", "LOCAL-FIRST"],
    definition: "Some words should only be kept, not explained.",
    sourceUrl: "https://github.com/Rain-dust/fushenglu",
    labelPosition: "label-fushenglu",
    shards: [
      { id: "fushenglu-paper", kind: "image", image: "/rain-dust/fragments/fushenglu-title.webp", clipPath: "polygon(12% 0, 88% 7%, 100% 68%, 62% 100%, 0 82%, 5% 23%)", x: 56, y: 13, width: 12, height: 23, rotate: -6, activeX: 5, activeY: 4, focusX: 13, focusY: 12, depth: 2 },
      { id: "fushenglu-quote", kind: "image", image: "/rain-dust/fragments/fushenglu-quote.webp", clipPath: "polygon(7% 13%, 73% 0, 100% 27%, 89% 91%, 24% 100%, 0 64%)", x: 78, y: 17, width: 7, height: 20, rotate: 7, activeX: -7, activeY: 5, focusX: -17, focusY: 12, depth: 3 },
      { id: "fushenglu-cat", kind: "image", image: "/rain-dust/fragments/fushenglu-cat.webp", clipPath: "polygon(0 19%, 37% 0, 100% 13%, 87% 83%, 48% 100%, 8% 69%)", x: 68, y: 46, width: 14, height: 15, rotate: 3, activeX: -1, activeY: -5, focusX: -4, focusY: -13, depth: 2 },
      { id: "fushenglu-seal", kind: "image", image: "/rain-dust/fragments/fushenglu-seal.webp", clipPath: "polygon(21% 0, 100% 18%, 83% 93%, 11% 100%, 0 31%)", x: 86, y: 51, width: 5, height: 8, rotate: -11, activeX: -12, activeY: 0, focusX: -25, focusY: -3, depth: 3 },
      { id: "fushenglu-branch", kind: "image", image: "/rain-dust/fragments/fushenglu-branch.webp", clipPath: "polygon(0 22%, 44% 0, 100% 31%, 92% 84%, 35% 100%, 8% 69%)", x: 46, y: 68, width: 15, height: 14, rotate: -9, activeX: 12, activeY: -9, focusX: 22, focusY: -24, depth: 1 },
      { id: "fushenglu-ink", kind: "image", image: "/rain-dust/source/fushenglu-current.webp", clipPath: "polygon(15% 0, 100% 7%, 76% 100%, 0 78%)", objectPosition: "50% 35%", x: 80, y: 71, width: 8, height: 13, rotate: 10, activeX: -8, activeY: -9, focusX: -19, focusY: -24, depth: 2 },
    ],
  },
  {
    id: "reimburse",
    title: "CAMPUS REIMBURSE KIT",
    year: "2026",
    tags: ["DESKTOP TOOL", "AUTOMATION", "WORKFLOW"],
    definition: "Turn reimbursement mess into one quiet sequence.",
    sourceUrl: "https://github.com/Rain-dust/campus-reimburse-kit",
    labelPosition: "label-reimburse",
    shards: [
      { id: "reimburse-receipt", kind: "receipt", content: "REIMBURSEMENT / 024", clipPath: "polygon(0 0, 93% 5%, 100% 79%, 87% 100%, 70% 88%, 56% 100%, 39% 89%, 21% 100%, 0 86%)", x: 51, y: 15, width: 14, height: 20, rotate: -7, activeX: 7, activeY: 5, focusX: 16, focusY: 13, depth: 2 },
      { id: "reimburse-amount", kind: "amount", content: "¥ 1,217.60", clipPath: "polygon(11% 0, 100% 16%, 84% 100%, 0 72%)", x: 78, y: 19, width: 10, height: 10, rotate: 8, activeX: -8, activeY: 7, focusX: -19, focusY: 17, depth: 3 },
      { id: "reimburse-grid", kind: "grid", clipPath: "polygon(0 24%, 30% 0, 100% 14%, 91% 91%, 43% 100%, 9% 76%)", x: 63, y: 44, width: 18, height: 18, rotate: 4, activeX: -2, activeY: -2, focusX: -5, focusY: -6, depth: 1 },
      { id: "reimburse-folder", kind: "folder", content: "ARCHIVE / CRK-024", clipPath: "polygon(8% 0, 79% 7%, 100% 43%, 88% 100%, 0 82%)", x: 45, y: 66, width: 11, height: 11, rotate: -10, activeX: 13, activeY: -8, focusX: 25, focusY: -23, depth: 2 },
      { id: "reimburse-order", kind: "order", content: "MESS → SORTED", clipPath: "polygon(0 13%, 87% 0, 100% 75%, 18% 100%)", x: 80, y: 70, width: 12, height: 9, rotate: 6, activeX: -10, activeY: -9, focusX: -22, focusY: -25, depth: 3 },
    ],
  },
  {
    id: "zhiwei",
    title: "知微",
    year: "2026",
    tags: ["AI-NATIVE", "DECISION", "INTERACTIVE"],
    definition: "What would you say next, if every word changed the path?",
    sourceUrl: "https://github.com/Rain-dust/Zhi-Wei",
    labelPosition: "label-zhiwei",
    shards: [
      { id: "zhiwei-path", kind: "image", image: "/rain-dust/fragments/zhiwei-path.webp", clipPath: "polygon(0 27%, 28% 0, 100% 19%, 91% 73%, 58% 100%, 8% 84%)", x: 50, y: 14, width: 18, height: 15, rotate: -5, activeX: 8, activeY: 6, focusX: 17, focusY: 17, depth: 1 },
      { id: "zhiwei-node", kind: "image", image: "/rain-dust/fragments/zhiwei-node.webp", clipPath: "polygon(8% 0, 100% 9%, 82% 100%, 21% 90%, 0 37%)", x: 76, y: 19, width: 13, height: 16, rotate: 7, activeX: -8, activeY: 6, focusX: -19, focusY: 15, depth: 3 },
      { id: "zhiwei-labels", kind: "image", image: "/rain-dust/fragments/zhiwei-labels.webp", clipPath: "polygon(20% 0, 100% 15%, 91% 72%, 61% 100%, 0 81%, 7% 21%)", x: 58, y: 47, width: 11, height: 18, rotate: 4, activeX: 4, activeY: -3, focusX: 9, focusY: -8, depth: 2 },
      { id: "zhiwei-dialogue", kind: "image", image: "/rain-dust/source/zhiwei-current.webp", clipPath: "polygon(0 18%, 35% 0, 100% 12%, 84% 100%, 14% 83%)", objectPosition: "68% 47%", x: 79, y: 50, width: 12, height: 16, rotate: -8, activeX: -10, activeY: -3, focusX: -23, focusY: -9, depth: 2 },
      { id: "zhiwei-signal", kind: "image", image: "/rain-dust/fragments/zhiwei-node.webp", clipPath: "polygon(23% 0, 100% 34%, 72% 100%, 0 76%, 8% 18%)", x: 46, y: 72, width: 8, height: 10, rotate: 11, activeX: 13, activeY: -10, focusX: 25, focusY: -27, depth: 3 },
    ],
  },
];

const stateLabels: Record<PortfolioState, string> = {
  opening: "OPENING",
  workspace: "WORK",
  "project-focus": "PROJECT FOCUS",
  info: "INFO",
};

function shardStyle(shard: Shard): CSSProperties {
  return {
    left: `${shard.x}%`,
    top: `${shard.y}%`,
    width: `${shard.width}vw`,
    height: `${shard.height}vh`,
    clipPath: shard.clipPath,
    "--shard-rotate": `${shard.rotate}deg`,
    "--active-rotate": `${shard.rotate * 0.32}deg`,
    "--focus-rotate": `${shard.rotate * 0.18}deg`,
    "--active-x": `${shard.activeX}vw`,
    "--active-y": `${shard.activeY}vh`,
    "--focus-x": `${shard.focusX}vw`,
    "--focus-y": `${shard.focusY}vh`,
    "--mobile-width": `${shard.width * 1.45}vw`,
    "--mobile-height": `${shard.height * 0.82}vh`,
  } as CSSProperties;
}

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);
  const revealTarget = useRef({ x: 73, y: 42 });
  const revealCurrent = useRef({ x: 73, y: 42 });
  const parallaxTarget = useRef({ x: 0, y: 0 });
  const parallaxCurrent = useRef({ x: 0, y: 0 });
  const wheelLocked = useRef(false);
  const touchStartX = useRef(0);
  const [state, setState] = useState<PortfolioState>("opening");
  const [activeProjectId, setActiveProjectId] = useState<ProjectId>("earth");
  const [revealActive, setRevealActive] = useState(false);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId],
  );

  const projectIndex = projects.findIndex((project) => project.id === activeProjectId);

  const moveProject = (direction: 1 | -1) => {
    const nextIndex = (projectIndex + direction + projects.length) % projects.length;
    setActiveProjectId(projects[nextIndex].id);
  };

  const enterWorkspace = () => setState("workspace");
  const enterProjectFocus = () => setState("project-focus");
  const leaveProjectFocus = () => setState("workspace");

  useEffect(() => {
    let frame = 0;
    const follow = () => {
      revealCurrent.current.x += (revealTarget.current.x - revealCurrent.current.x) * 0.14;
      revealCurrent.current.y += (revealTarget.current.y - revealCurrent.current.y) * 0.14;
      parallaxCurrent.current.x += (parallaxTarget.current.x - parallaxCurrent.current.x) * 0.09;
      parallaxCurrent.current.y += (parallaxTarget.current.y - parallaxCurrent.current.y) * 0.09;

      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--mx", `${revealCurrent.current.x}%`);
        root.style.setProperty("--my", `${revealCurrent.current.y}%`);
        root.style.setProperty("--px1", `${parallaxCurrent.current.x * 0.34}px`);
        root.style.setProperty("--py1", `${parallaxCurrent.current.y * 0.34}px`);
        root.style.setProperty("--px2", `${parallaxCurrent.current.x * 0.68}px`);
        root.style.setProperty("--py2", `${parallaxCurrent.current.y * 0.68}px`);
        root.style.setProperty("--px3", `${parallaxCurrent.current.x}px`);
        root.style.setProperty("--py3", `${parallaxCurrent.current.y}px`);
      }
      frame = window.requestAnimationFrame(follow);
    };
    frame = window.requestAnimationFrame(follow);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (state === "project-focus") leaveProjectFocus();
        else if (state === "info") setState("workspace");
        return;
      }
      if (event.key === "Enter") {
        if (state === "opening") enterWorkspace();
        else if (state === "workspace") enterProjectFocus();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (state === "opening") enterWorkspace();
        else if (state === "workspace" || state === "project-focus") moveProject(1);
        else if (state === "info") setState("opening");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (state === "project-focus") leaveProjectFocus();
        else if (state === "workspace") moveProject(-1);
        else if (state === "info") setState("workspace");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [projectIndex, state]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    revealTarget.current = { x: x * 100, y: y * 100 };
    parallaxTarget.current = { x: (x - 0.5) * 12, y: (y - 0.5) * 12 };
    if (state === "opening" && x > 0.45) setRevealActive(true);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault();
    if (wheelLocked.current || Math.abs(event.deltaY) < 20) return;
    wheelLocked.current = true;
    window.setTimeout(() => (wheelLocked.current = false), 650);
    const direction = event.deltaY > 0 ? 1 : -1;
    if (state === "opening" && direction > 0) enterWorkspace();
    else if (state === "workspace") moveProject(direction);
    else if (state === "project-focus" && direction < 0) leaveProjectFocus();
    else if (state === "info" && direction < 0) setState("workspace");
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    if (Math.abs(distance) < 48) return;
    const direction: 1 | -1 = distance < 0 ? 1 : -1;
    if (state === "opening" && direction > 0) enterWorkspace();
    else if (state === "workspace") moveProject(direction);
    else if (state === "project-focus" && direction < 0) leaveProjectFocus();
    else if (state === "info" && direction < 0) setState("workspace");
  };

  const handleProjectSelect = (event: ReactPointerEvent<HTMLButtonElement>, id: ProjectId) => {
    if (event.pointerType === "touch" && activeProjectId !== id) {
      setActiveProjectId(id);
      return;
    }
    setActiveProjectId(id);
    enterProjectFocus();
  };

  return (
    <main
      ref={rootRef}
      className="portfolio"
      data-state={state}
      data-project={activeProjectId}
      data-reveal={revealActive}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setRevealActive(false);
        parallaxTarget.current = { x: 0, y: 0 };
      }}
      onWheel={handleWheel}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? 0;
      }}
      onTouchEnd={handleTouchEnd}
    >
      <a className="skip-link" href="#portfolio-stage">跳到作品集空间</a>

      <header className="shell-header">
        <button className="brand" type="button" onClick={() => setState("opening")}>
          <span>RAIN_DUST</span>
          <strong>寻辰沐雨</strong>
        </button>
        <nav aria-label="作品集状态">
          {(["opening", "workspace", "info"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={state === item || (item === "workspace" && state === "project-focus") ? "is-current" : ""}
              onClick={() => setState(item)}
            >
              {item === "workspace" ? "WORK" : item.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <div className="signal-mark" aria-hidden="true"><i /></div>
      <p className="sr-only" aria-live="polite">当前状态：{stateLabels[state]}，当前项目：{activeProject.title}</p>

      <div className="portfolio-stage" id="portfolio-stage">
        <section className="state-panel opening-panel" aria-hidden={state !== "opening"}>
          <div className="opening-copy">
            <span className="opening-label">PRIVATE DIGITAL SPACE</span>
            <h1>
              I MAKE DIGITAL THINGS
              <br />OUT OF THOUGHTS,
              <br />FEELINGS AND
              <br />SMALL PROBLEMS.
            </h1>
            <p>我喜欢把脑子里的东西，做成真的。</p>
            <button className="enter-space" type="button" onClick={enterWorkspace}>
              <i aria-hidden="true" /> ENTER SPACE
            </button>
          </div>

          <div className="opening-portrait" aria-hidden="true">
            <img className="portrait-base" src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp" alt="" />
            <img className="portrait-reveal" src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp" alt="" />
            <span className="red-eye" />
            <span className="residue residue-orbit" />
            <span className="residue residue-path">MEMORY FRAGMENT</span>
            <i className="hair-strand hair-1" />
            <i className="hair-strand hair-2" />
            <i className="hair-strand hair-3" />
            <i className="hair-strand hair-4" />
            <i className="hair-strand hair-5" />
          </div>
        </section>

        <section className="state-panel workspace-panel" aria-hidden={state !== "workspace" && state !== "project-focus"}>
          <div className="workspace-note">
            <span>SELECTED WORK</span>
            <small>HOVER / CLICK / ARROW KEYS</small>
          </div>

          <div className="shard-space" aria-hidden="true">
            {projects.flatMap((project) =>
              project.shards.map((shard) => (
                <div
                  key={shard.id}
                  className={`glass-shard depth-${shard.depth} shard-${shard.kind}`}
                  data-project={project.id}
                  style={shardStyle(shard)}
                >
                  <div className="shard-parallax">
                    {shard.image ? (
                      <img src={shard.image} alt="" style={{ objectPosition: shard.objectPosition ?? "center" }} />
                    ) : (
                      <span>{shard.content}</span>
                    )}
                  </div>
                </div>
              )),
            )}
          </div>

          <div className="project-constellation">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`project-name ${project.labelPosition}`}
                data-project={project.id}
                aria-pressed={activeProjectId === project.id}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch" && state === "workspace") setActiveProjectId(project.id);
                }}
                onFocus={() => setActiveProjectId(project.id)}
                onPointerUp={(event) => handleProjectSelect(event, project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveProjectId(project.id);
                    enterProjectFocus();
                  }
                }}
              >
                <small>{project.definition}</small>
                <strong>{project.title}</strong>
                <span>OPEN</span>
              </button>
            ))}
          </div>

          <div className="project-focus" aria-hidden={state !== "project-focus"}>
            <button type="button" className="focus-back" onClick={leaveProjectFocus}>← BACK</button>
            <div className="focus-meta">
              <span>{activeProject.year}</span>
              <h2>{activeProject.title}</h2>
              <p>{activeProject.definition}</p>
              <ul>{activeProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <div className="focus-links">
                {activeProject.demoUrl ? (
                  <a href={activeProject.demoUrl} target="_blank" rel="noreferrer">VIEW ↗</a>
                ) : (
                  <span aria-disabled="true">VIEW —</span>
                )}
                <a href={activeProject.sourceUrl} target="_blank" rel="noreferrer">SOURCE ↗</a>
              </div>
            </div>
          </div>
        </section>

        <section className="state-panel info-panel" aria-hidden={state !== "info"}>
          <div className="info-identities">
            <span>INTP</span>
            <span>INDEPENDENT <br className="mobile-break" />BUILDER</span>
            <span>AI-NATIVE <br className="mobile-break" />CREATOR</span>
          </div>
          <div className="info-links">
            <a href="https://github.com/Rain-dust" target="_blank" rel="noreferrer">GITHUB ↗</a>
            <span>EMAIL / TO BE REPLACED</span>
            <span>BILIBILI / TO BE REPLACED</span>
            <small>OTHER SIDE / NOT YET MAPPED</small>
          </div>
          <img src="/rain-dust/hero/hero-girl-crop-v2.webp" alt="" aria-hidden="true" />
        </section>
      </div>

      <footer className="shell-footer">
        <span>{stateLabels[state]}</span>
        <div><kbd>←</kbd><kbd>→</kbd><span>MOVE</span><kbd>ENTER</kbd><span>OPEN</span><kbd>ESC</kbd><span>BACK</span></div>
        <span>V3 / SINGLE VIEWPORT</span>
      </footer>
    </main>
  );
}
