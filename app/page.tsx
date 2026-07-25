"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type TrailMark = {
  id: number;
  x: number;
  y: number;
  angle: number;
};

type ProjectId = "earth" | "fushenglu" | "reimburse" | "zhiwei";

const signalSections = [
  ["opening", "OPENING"],
  ["about", "ABOUT"],
  ["interlude", "INTERLUDE"],
  ["work", "SELECTED WORK"],
  ["archive", "ARCHIVE"],
  ["other-side", "OTHER SIDE"],
] as const;

const projects: Array<{
  id: ProjectId;
  name: string;
  eyebrow: string;
  href: string;
}> = [
  {
    id: "earth",
    name: "EARTH ONLINE",
    eyebrow: "A WORLD THAT KEEPS RUNNING",
    href: "https://github.com/Rain-dust/earth-online",
  },
  {
    id: "fushenglu",
    name: "浮生录",
    eyebrow: "SOME WORDS SHOULD ONLY BE KEPT",
    href: "https://github.com/Rain-dust/fushenglu",
  },
  {
    id: "reimburse",
    name: "CAMPUS REIMBURSE KIT",
    eyebrow: "THIS PROCESS WAS TOO ANNOYING",
    href: "https://github.com/Rain-dust/campus-reimburse-kit",
  },
  {
    id: "zhiwei",
    name: "知微",
    eyebrow: "WHAT WOULD YOU SAY NEXT?",
    href: "https://github.com/Rain-dust/Zhi-Wei",
  },
];

function addUnique<T>(values: Set<T>, value: T) {
  if (values.has(value)) return values;
  const next = new Set(values);
  next.add(value);
  return next;
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const exploredKeys = useRef(new Set(["opening"]));
  const revealTarget = useRef({ x: 72, y: 43 });
  const revealCurrent = useRef({ x: 72, y: 43 });
  const trailId = useRef(0);
  const lastTrailAt = useRef(0);
  const [explored, setExplored] = useState(7);
  const [heroProgress, setHeroProgress] = useState(0);
  const [revealActive, setRevealActive] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectId | null>(null);
  const [trailMarks, setTrailMarks] = useState<TrailMark[]>([]);
  const [otherSideOpen, setOtherSideOpen] = useState(false);
  const [soundTouched, setSoundTouched] = useState(false);

  const markExplore = useCallback((key: string, amount: number) => {
    if (exploredKeys.current.has(key)) return;
    exploredKeys.current = addUnique(exploredKeys.current, key);
    setExplored((value) => Math.min(92, value + amount));
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateHero = () => {
      const next = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      setHeroProgress(next);
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHero);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHero();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const follow = () => {
      const current = revealCurrent.current;
      const target = revealTarget.current;
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      heroRef.current?.style.setProperty("--mx", `${current.x}%`);
      heroRef.current?.style.setProperty("--my", `${current.y}%`);
      frame = window.requestAnimationFrame(follow);
    };
    frame = window.requestAnimationFrame(follow);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          const key = element.dataset.explore;
          const amount = Number(element.dataset.amount ?? 5);
          if (key) markExplore(key, amount);
        }
      },
      { threshold: 0.38 },
    );

    document.querySelectorAll<HTMLElement>("[data-explore]").forEach((element) => {
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [markExplore]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOtherSideOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleReveal = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    revealTarget.current = {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
    if (!revealActive) {
      setRevealActive(true);
      markExplore("hero-reveal", 8);
    }
  };

  const handleInterludeTrail = (event: ReactPointerEvent<HTMLElement>) => {
    const now = performance.now();
    if (now - lastTrailAt.current < 42) return;
    lastTrailAt.current = now;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const id = ++trailId.current;
    const angle = ((x + y) % 38) - 19;

    setTrailMarks((marks) => [...marks, { id, x, y, angle }].slice(-38));
    window.setTimeout(() => {
      setTrailMarks((marks) => marks.filter((mark) => mark.id !== id));
    }, 2300);
    markExplore("interlude-trail", 7);
  };

  const activateProject = (id: ProjectId) => {
    setActiveProject(id);
    markExplore(`project-${id}`, 5);
  };

  const openOtherSide = () => {
    setOtherSideOpen(true);
    markExplore("other-side-open", 8);
  };

  return (
    <main>
      <a className="skip-link" href="#about">
        跳到主要内容
      </a>

      <aside className="signal-trace" aria-label="页面章节">
        <div className="signal-line" aria-hidden="true">
          <span />
        </div>
        <nav>
          {signalSections.map(([href, label]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <aside className="explored" aria-label={`探索程度 ${explored}%`}>
        <span>EXPLORED</span>
        <strong>{String(explored).padStart(2, "0")}%</strong>
      </aside>

      <section
        className="opening"
        id="opening"
        ref={heroRef}
        onPointerMove={handleReveal}
        onPointerLeave={() => setRevealActive(false)}
        data-reveal-active={revealActive}
        style={{ "--hero-progress": heroProgress } as CSSProperties}
      >
        <div className="opening-frame">
          <header className="site-header">
            <a className="brand" href="#opening" aria-label="寻辰沐雨，返回开场">
              <span>RAIN_DUST / 00</span>
              <strong>寻辰沐雨</strong>
            </a>
            <nav className="top-nav" aria-label="主要导航">
              <a href="#about">ABOUT</a>
              <a href="#work">WORK</a>
              <a href="#archive">ARCHIVE</a>
              <button
                type="button"
                className={explored >= 35 ? "other-side-ready" : ""}
                onClick={openOtherSide}
              >
                {explored >= 35 ? "OTHER SIDE" : "···"}
              </button>
            </nav>
          </header>

          <div className="hero-copy">
            <p className="location-copy">
              BASED SOMEWHERE BETWEEN
              <br />
              REALITY AND THE INTERNET.
            </p>
            <h1 aria-label="I make digital things out of thoughts, feelings and small problems.">
              <span>I MAKE</span>
              <span>DIGITAL THINGS</span>
              <span>OUT OF</span>
              <span className="ghost-word" data-ghost="念头">
                THOUGHTS,
              </span>
              <span className="ghost-word" data-ghost="感受">
                FEELINGS AND
              </span>
              <span className="ghost-word" data-ghost="一些忍不住想解决的麻烦">
                SMALL PROBLEMS.
              </span>
            </h1>
            <p className="hero-cn">
              我喜欢把脑子里的东西，
              <br />
              做成真的。
            </p>
          </div>

          <div className="hero-portrait" aria-hidden="true">
            <img
              className="portrait-base"
              src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
              alt=""
            />
            <img
              className="portrait-reveal"
              src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
              alt=""
            />
            <div className="reveal-ghosts">
              <span className="ghost-orbit" />
              <span className="ghost-grid" />
              <small>OTHER SIDE</small>
              <i>MEMORY FRAGMENT</i>
            </div>
            <span className="hair-strand hair-1" />
            <span className="hair-strand hair-2" />
            <span className="hair-strand hair-3" />
            <span className="hair-strand hair-4" />
            <span className="hair-strand hair-5" />
          </div>

          <div className="hero-status">
            <button type="button" onClick={() => setSoundTouched(true)}>
              {soundTouched ? "SOUND — NO TRACK" : "SOUND OFF"}
            </button>
            <a href="#about" className="scroll-cue">
              <span aria-hidden="true">↓</span>
              SCROLL
            </a>
            <span>PRIVATE SPACE / RUNNING</span>
          </div>
        </div>
      </section>

      <section
        className="about"
        id="about"
        data-explore="about"
        data-amount="8"
      >
        <div className="about-background" aria-hidden="true">
          <span>THOUGHTS</span>
          <span>FEELINGS</span>
          <span>PROBLEMS</span>
        </div>
        <div className="section-kicker">
          <span>PERSONAL OBSERVATION / IN PROGRESS</span>
          <i />
        </div>
        <div className="about-copy">
          <h2>一张仍在被补充的个人观察页。</h2>
          <p>
            INTP，独立开发者。
            <br />
            也是一个经常被突然出现的想法打断的人。
          </p>
          <p>
            我没有固定的创作方向。
            <br />
            有时做产品，有时写工具，
            <br />
            有时只是想看看一个念头
            <br />
            最终能够长成什么样。
          </p>
        </div>

        <div className="identity-fragments" aria-label="身份碎片">
          <span className="identity-intp">INTP</span>
          <span className="identity-builder">INDEPENDENT BUILDER</span>
          <span className="identity-ai">
            AI-NATIVE CREATOR <small>v1.07</small>
          </span>
          <span className="identity-direction">
            NO FIXED DIRECTION
            <small>THAT MAY BE THE DIRECTION.</small>
          </span>
        </div>

        <div className="observation-images" aria-label="创作观察碎片">
          <figure className="observation observation-editor">
            <img
              src="/rain-dust/source/zhiwei-current.webp"
              alt="知微项目编辑界面局部"
            />
            <figcaption>01 / EDITOR RESIDUE</figcaption>
          </figure>
          <figure className="observation observation-thought">
            <img
              src="/rain-dust/source/earth-online-current.webp"
              alt="Earth Online 项目运行画面局部"
            />
            <figcaption>02 / A THOUGHT TAKING SHAPE</figcaption>
          </figure>
          <figure className="observation observation-aesthetic">
            <img
              src="/rain-dust/source/fushenglu-current.webp"
              alt="浮生录视觉情绪局部"
            />
            <figcaption>03 / AESTHETIC REMAINS</figcaption>
          </figure>
        </div>

        <p className="about-ending">
          这些仍然不足以解释我。
          <span>THE WORK MAY EXPLAIN A LITTLE MORE.</span>
        </p>
      </section>

      <section
        className="interlude"
        id="interlude"
        data-explore="interlude"
        data-amount="6"
        onPointerMove={handleInterludeTrail}
      >
        <div className="interlude-heading">
          <span>DIGITAL INTERLUDE</span>
          <h2>未完成的念头场</h2>
        </div>

        <div className="trail-field" aria-hidden="true">
          {trailMarks.map((mark) => (
            <span
              className="trail-mark"
              key={mark.id}
              style={
                {
                  left: `${mark.x}%`,
                  top: `${mark.y}%`,
                  "--trail-angle": `${mark.angle}deg`,
                } as CSSProperties
              }
            />
          ))}
          <span className="hidden-thought thought-a">
            A WORLD THAT KEEPS RUNNING
          </span>
          <span className="hidden-thought thought-b">
            SOME WORDS SHOULD ONLY BE KEPT
          </span>
          <span className="hidden-thought thought-c">
            THIS PROCESS WAS TOO ANNOYING
          </span>
          <span className="hidden-thought thought-d">
            WHAT WOULD YOU SAY NEXT?
          </span>
          <i className="signal-pulse" />
        </div>

        <p className="interlude-ending">
          有些念头最后变成了作品。
          <span>SOME OF THEM BECAME REAL.</span>
        </p>
      </section>

      <section
        className="spatial-work"
        id="work"
        data-active={activeProject ?? "none"}
        data-explore="work"
        data-amount="7"
        onPointerLeave={() => setActiveProject(null)}
      >
        <div className="work-heading">
          <span>SELECTED WORK</span>
          <p>项目不是陈列品。它们是被唤醒的空间碎片。</p>
        </div>

        <div className="project-names">
          {projects.map((project) => (
            <a
              key={project.id}
              className={`project-link project-link-${project.id}`}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={() => activateProject(project.id)}
              onFocus={() => activateProject(project.id)}
            >
              <small>{project.eyebrow}</small>
              <strong>{project.name}</strong>
              <span>OPEN GITHUB ↗</span>
            </a>
          ))}
        </div>

        <div className="fragment-field" aria-hidden="true">
          <div className="fragment-group fragments-earth" data-project="earth">
            <span className="night-wash" />
            <img
              className="earth-globe"
              src="/rain-dust/fragments/earth-globe.webp"
              alt=""
            />
            <img
              className="earth-orbits"
              src="/rain-dust/fragments/earth-orbits.webp"
              alt=""
            />
            <img
              className="earth-status"
              src="/rain-dust/fragments/earth-status.webp"
              alt=""
            />
            <span className="earth-copy">THE WORLD IS RUNNING.</span>
            <span className="earth-coordinates">31.2304° N / 121.4737° E</span>
          </div>

          <div
            className="fragment-group fragments-fushenglu"
            data-project="fushenglu"
          >
            <span className="paper-wash" />
            <img
              className="fushenglu-title"
              src="/rain-dust/fragments/fushenglu-title.webp"
              alt=""
            />
            <img
              className="fushenglu-cat"
              src="/rain-dust/fragments/fushenglu-cat.webp"
              alt=""
            />
            <img
              className="fushenglu-seal"
              src="/rain-dust/fragments/fushenglu-seal.webp"
              alt=""
            />
            <img
              className="fushenglu-branch"
              src="/rain-dust/fragments/fushenglu-branch.webp"
              alt=""
            />
            <img
              className="fushenglu-quote"
              src="/rain-dust/fragments/fushenglu-quote.webp"
              alt=""
            />
          </div>

          <div
            className="fragment-group fragments-reimburse"
            data-project="reimburse"
          >
            <span className="receipt-piece">
              <small>REIMBURSEMENT / 2026-07</small>
              <strong>¥ 1,217.60</strong>
              <i>ORIGINAL RECEIPTS: 08</i>
            </span>
            <span className="table-piece" />
            <span className="folder-piece">ARCHIVE / CRK-024</span>
            <span className="sorted-piece">MESS → SORTED</span>
            <span className="tear-piece">APPROVED</span>
          </div>

          <div className="fragment-group fragments-zhiwei" data-project="zhiwei">
            <span className="zhiwei-wash" />
            <img
              className="zhiwei-path"
              src="/rain-dust/fragments/zhiwei-path.webp"
              alt=""
            />
            <img
              className="zhiwei-node"
              src="/rain-dust/fragments/zhiwei-node.webp"
              alt=""
            />
            <img
              className="zhiwei-labels"
              src="/rain-dust/fragments/zhiwei-labels.webp"
              alt=""
            />
            <span className="zhiwei-copy">WHAT WOULD YOU SAY NEXT?</span>
          </div>
        </div>
      </section>

      <section
        className="archive"
        id="archive"
        data-explore="archive"
        data-amount="5"
      >
        <header>
          <span>ARCHIVE / NOTES</span>
          <h2>没有完成，也值得被留下。</h2>
        </header>
        <div className="archive-list">
          <a
            href="https://github.com/Rain-dust/MindCache"
            target="_blank"
            rel="noreferrer"
          >
            <time>2026 — NOW</time>
            <strong>MindCache</strong>
            <span>MEMORY TOOL / OPEN SOURCE ↗</span>
          </a>
          <div>
            <time>ONGOING</time>
            <strong>SMALL EXPERIMENTS</strong>
            <span>UI / AUTOMATION / THOUGHT TOOLS</span>
          </div>
          <div>
            <time>UNFINISHED</time>
            <strong>PROCESS DRAFTS</strong>
            <span>AI COLLABORATION RECORDS</span>
          </div>
          <div>
            <time>SOON</time>
            <strong>NOTES FOR A FUTURE ARTICLE</strong>
            <span>NOT YET ARRANGED</span>
          </div>
        </div>
      </section>

      <section
        className="contact"
        id="other-side"
        data-explore="contact"
        data-amount="4"
      >
        <div className="contact-copy">
          <span>OTHER SIDE / CONTACT</span>
          <h2>
            THE PAGE ENDS.
            <br />
            THE SPACE DOES NOT.
          </h2>
          <p>如果你也在把某个念头做成真的，可以来找我。</p>
        </div>
        <div className="contact-links">
          <a href="https://github.com/Rain-dust" target="_blank" rel="noreferrer">
            GITHUB ↗
          </a>
          <span>EMAIL / TO BE REPLACED</span>
          <span>BILIBILI / TO BE REPLACED</span>
          <button type="button" onClick={openOtherSide}>
            OPEN THE OTHER SIDE
          </button>
        </div>
        <footer>
          <span>寻辰沐雨 / RAIN_DUST</span>
          <span>PRIVATE SPACE / V1</span>
        </footer>
      </section>

      {otherSideOpen && (
        <div
          className="other-side-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="other-side-title"
        >
          <button
            className="overlay-close"
            type="button"
            onClick={() => setOtherSideOpen(false)}
            aria-label="关闭另一侧"
          >
            CLOSE ×
          </button>
          <img
            src="/rain-dust/hero/hero-girl-crop-v2.webp"
            alt=""
            aria-hidden="true"
          />
          <div className="other-side-copy">
            <span>THE OTHER SIDE / PROTOTYPE LAYER</span>
            <h2 id="other-side-title">有些部分，不属于作品说明。</h2>
            <p>
              AIMER / QUIET NIGHT / LINE ART / SMALL WORLDS
              <br />
              LONG CONVERSATIONS / UNFINISHED IDEAS
            </p>
            <small>这只是第二层的入口。它会在后续继续生长。</small>
          </div>
        </div>
      )}
    </main>
  );
}
