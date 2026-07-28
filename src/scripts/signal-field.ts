const RED = "169, 37, 52";

type SignalField = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  host: HTMLElement;
  projects: HTMLElement[];
  nodes: HTMLElement[];
  active: number;
  visible: boolean;
  reducedMotion: boolean;
  frame: number;
  width: number;
  height: number;
  dpr: number;
  dash: number;
};

function resize(field: SignalField) {
  const bounds = field.host.getBoundingClientRect();
  field.width = bounds.width;
  field.height = bounds.height;
  field.dpr = Math.min(window.devicePixelRatio || 1, 2);
  field.canvas.width = Math.round(field.width * field.dpr);
  field.canvas.height = Math.round(field.height * field.dpr);
  field.context.setTransform(field.dpr, 0, 0, field.dpr, 0, 0);
}

function nodePoints(field: SignalField) {
  const hostBounds = field.host.getBoundingClientRect();

  return field.nodes.map((node) => {
    const bounds = node.getBoundingClientRect();
    return {
      x: bounds.left - hostBounds.left + bounds.width / 2,
      y: bounds.top - hostBounds.top + bounds.height / 2,
    };
  });
}

function draw(field: SignalField) {
  const { context, width, height } = field;
  const points = nodePoints(field);

  context.clearRect(0, 0, width, height);
  if (points.length < 2) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpoint = (previous.y + current.y) / 2;
    context.bezierCurveTo(
      previous.x,
      midpoint,
      current.x,
      midpoint,
      current.x,
      current.y,
    );
  }
  context.setLineDash([2, 13]);
  context.lineDashOffset = field.dash;
  context.strokeStyle = `rgba(${RED}, 0.56)`;
  context.lineWidth = 1;
  context.stroke();

  points.forEach((point, index) => {
    const selected = field.active === index;
    context.beginPath();
    context.arc(point.x, point.y, selected ? 7 : 3, 0, Math.PI * 2);
    context.fillStyle = selected
      ? `rgba(${RED}, 0.92)`
      : "rgba(226, 229, 230, 0.72)";
    context.shadowBlur = selected ? 22 : 0;
    context.shadowColor = `rgba(${RED}, 0.72)`;
    context.fill();
  });

  context.restore();
}

function animate(field: SignalField) {
  field.dash -= 0.28;
  draw(field);

  if (field.visible && !field.reducedMotion) {
    field.frame = window.requestAnimationFrame(() => animate(field));
  }
}

function mount(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>("[data-signal-canvas]");
  const projects = Array.from(host.querySelectorAll<HTMLElement>("[data-project]"));
  const nodes = Array.from(host.querySelectorAll<HTMLElement>("[data-project-node]"));
  const context = canvas?.getContext("2d");
  if (!canvas || !context || nodes.length < 2) return;

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const field: SignalField = {
    canvas,
    context,
    host,
    projects,
    nodes,
    active: -1,
    visible: false,
    reducedMotion: media.matches,
    frame: 0,
    width: 0,
    height: 0,
    dpr: 1,
    dash: 0,
  };

  const select = (index: number) => {
    field.active = index;
    draw(field);
  };

  projects.forEach((project, index) => {
    project.addEventListener("pointerenter", () => select(index));
    project.addEventListener("pointerleave", () => select(-1));
    project.addEventListener("focusin", () => select(index));
    project.addEventListener("focusout", () => select(-1));
  });

  const resizeObserver = new ResizeObserver(() => {
    resize(field);
    draw(field);
  });
  resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    field.visible = entry.isIntersecting;
    window.cancelAnimationFrame(field.frame);
    if (field.visible && !field.reducedMotion) {
      field.frame = window.requestAnimationFrame(() => animate(field));
    } else {
      draw(field);
    }
  });
  visibilityObserver.observe(host);

  media.addEventListener("change", (event) => {
    field.reducedMotion = event.matches;
    window.cancelAnimationFrame(field.frame);
    if (field.visible && !field.reducedMotion) {
      field.frame = window.requestAnimationFrame(() => animate(field));
    } else {
      draw(field);
    }
  });

  resize(field);
  draw(field);
}

export function mountSignalFields() {
  document.querySelectorAll<HTMLElement>("[data-project-field]").forEach(mount);
}
