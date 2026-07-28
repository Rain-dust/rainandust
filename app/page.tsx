"use client";
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
};

const PROJECTS: Project[] = [
  {
    id: "earth",
    title: "Earth Online",
    description: "把现实世界写成一张持续运行的网页。",
    image: "/rain-dust/masters/earth-master.webp",
    source: "https://github.com/Rain-dust/earth-online",
  },
  {
    id: "fushenglu",
    title: "浮生录",
    description: "收下一句话，也留住它经过的那一天。",
    image: "/rain-dust/masters/fushenglu-master.webp",
    source: "https://github.com/Rain-dust/fushenglu",
  },
  {
    id: "zhiwei",
    title: "知微",
    description: "在细微信号与有限信息中，练习判断、表达与决策。",
    image: "/rain-dust/masters/zhiwei-master.webp",
    source: "https://github.com/Rain-dust/Zhi-Wei",
  },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const segment = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

export default function Home() {
  const revealTrackRef = useRef<HTMLElement>(null);
  const endingRef = useRef<HTMLElement>(null);
  const previousRevealRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [endingActive, setEndingActive] = useState(false);

  const daylight = 1 - smooth(segment(progress, 0.04, 0.3));
  const takeover = smooth(segment(progress, 0.08, 0.62));
  const girlPresence =
    smooth(segment(progress, 0.28, 0.48)) *
    (1 - smooth(segment(progress, 0.72, 0.96)));
  const shadowScale = 0.04 + takeover * 4.8;

  const playRevealSound = useCallback(() => {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextClass) return;

    const context =
      audioContextRef.current ?? new AudioContextClass({ latencyHint: "interactive" });
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();

    const now = context.currentTime;
    const master = context.createGain();
    const low = context.createOscillator();
    const body = context.createOscillator();
    const filter = context.createBiquadFilter();

    low.type = "sine";
    low.frequency.setValueAtTime(42, now);
    low.frequency.exponentialRampToValueAtTime(31, now + 0.72);
    body.type = "triangle";
    body.frequency.setValueAtTime(78, now);
    body.frequency.exponentialRampToValueAtTime(48, now + 0.46);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);
    filter.Q.setValueAtTime(0.7, now);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.14, now + 0.028);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.86);

    low.connect(filter);
    body.connect(filter);
    filter.connect(master);
    master.connect(context.destination);
    low.start(now);
    body.start(now);
    low.stop(now + 0.9);
    body.stop(now + 0.58);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = revealTrackRef.current;
    if (!track) return;

    let animationFrame = 0;
    let active = true;
    let lastValue = -1;

    const read = () => {
      if (!active) return;
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const raw = clamp(-rect.top / distance);
      const next = reducedMotion ? (raw < 0.12 ? 0 : 0.58) : raw;
      if (Math.abs(next - lastValue) > 0.001) {
        lastValue = next;
        setProgress(next);
      }
      animationFrame = window.requestAnimationFrame(read);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = window.requestAnimationFrame(read);
        }
      },
      { rootMargin: "10% 0px" },
    );

    observer.observe(track);
    animationFrame = window.requestAnimationFrame(read);
    return () => {
      active = false;
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const ending = endingRef.current;
    if (!ending) return;
    const observer = new IntersectionObserver(
      ([entry]) => setEndingActive(entry.isIntersecting),
      { threshold: 0.22 },
    );
    observer.observe(ending);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      soundEnabled &&
      !reducedMotion &&
      progress >= 0.46 &&
      previousRevealRef.current < 0.46
    ) {
      playRevealSound();
    }
    previousRevealRef.current = progress;
  }, [playRevealSound, progress, reducedMotion, soundEnabled]);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
    },
    [],
  );

  const toggleSound = () => {
    setSoundEnabled((enabled) => !enabled);
  };

  return (
    <main>
      <a className="skip-link" href="#works">
        跳到作品
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="返回顶部">
          RAIN_DUST
        </a>
        <button
          className="sound-toggle"
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleSound}
        >
          SOUND {soundEnabled ? "ON" : "OFF"}
        </button>
      </header>

      <section
        id="top"
        ref={revealTrackRef}
        className="reveal-track"
        aria-label="白昼与影子的交界"
        style={
          {
            "--daylight": daylight,
            "--takeover": takeover,
            "--girl": girlPresence,
            "--shadow-scale": shadowScale,
          } as CSSProperties
        }
      >
        <div className="reveal-stage">
          <div className="daylight-layer">
            <div className="daylight-copy">
              <p className="name-latin">RAIN_DUST</p>
              <h1>寻辰沐雨</h1>
              <p className="identity">Independent builder / AI-native creator</p>
            </div>

            <img
              className="daylight-portrait"
              src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
              alt=""
              aria-hidden="true"
            />
            <span className="daylight-eye" aria-hidden="true" />
            <p className="scroll-cue" aria-hidden="true">
              SCROLL <span />
            </p>
          </div>

          <div className="shadow-origin" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="night-veil" aria-hidden="true" />

          <div className="girl-reveal" aria-hidden="true">
            <div className="girl-floor-shadow" />
            <img
              src="/rain-dust/hero/hero-girl-reveal-v2.webp"
              alt=""
            />
          </div>

          <div className="reveal-grain" aria-hidden="true" />
        </div>
      </section>

      <section id="works" className="night-world" aria-labelledby="works-title">
        <div className="night-afterimage" aria-hidden="true">
          <img
            src="/rain-dust/hero/hero-girl-lineart-temp-v2.webp"
            alt=""
          />
        </div>
        <div className="night-shadow" aria-hidden="true" />

        <div className="works-heading">
          <h2 id="works-title">Selected work</h2>
          <p>Three things I chose to keep.</p>
        </div>

        <div className="works-editorial">
          {PROJECTS.map((project) => (
            <article
              className={`work work-${project.id}`}
              key={project.id}
            >
              <a
                className="work-link"
                href={project.source}
                target="_blank"
                rel="noreferrer"
                aria-label={`打开 ${project.title} 源码仓库`}
              >
                <figure>
                  <img
                    src={project.image}
                    alt={`${project.title} 项目画面`}
                    loading="lazy"
                  />
                </figure>
                <div className="work-copy">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </a>
            </article>
          ))}
        </div>

        <div className="quiet-index">
          <span>Also made</span>
          <a
            href="https://github.com/Rain-dust/campus-reimburse-kit"
            target="_blank"
            rel="noreferrer"
          >
            Campus Reimburse Kit
          </a>
          <p>校园报销流程工具</p>
        </div>
      </section>

      <section
        ref={endingRef}
        className={`ending ${endingActive ? "is-active" : ""}`}
        aria-label="联系信息"
      >
        <div className="ending-shadow" aria-hidden="true" />
        <div className="ending-content">
          <p className="ending-name">寻辰沐雨</p>
          <nav aria-label="联系方式">
            <a
              href="https://github.com/Rain-dust"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
          <p className="nothing-happened">刚才什么也没有发生。</p>
        </div>
      </section>
    </main>
  );
}
