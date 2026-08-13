import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type ProjectVault3D = {
  destroy: () => void;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type VaultSurfaceTextures = {
  color: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
};

type VaultTextures = {
  masonry: VaultSurfaceTextures;
  stone: VaultSurfaceTextures;
  wood: VaultSurfaceTextures;
};

type VaultProjectFocus = {
  id: string;
  accent: string;
  name: string;
  kicker: string;
  summary: string;
  details: string;
  side: -1 | 1;
  position: THREE.Vector3;
  cameraPosition: THREE.Vector3;
};

type VaultBottle = {
  group: THREE.Group;
  hitTargets: THREE.Object3D[];
  labelTarget: THREE.Object3D;
};

type VaultBottleDesign = {
  glass: number;
  segments: number;
  profile: Array<[number, number]>;
  closure: "cork" | "wax" | "metal";
  closureColor: number;
  closureRadius: number;
  closureHeight: number;
  labelWidth: number;
  labelHeight: number;
  labelY: number;
  paper: string;
  ink: string;
  accent: string;
  variant: "orbit" | "ledger" | "index" | "tide" | "literary" | "archive";
};

const bottleDesigns: Record<string, VaultBottleDesign> = {
  earth: {
    glass: 0x183128, segments: 36,
    profile: [[0,-1.36],[.55,-1.32],[.59,.86],[.56,1.1],[.43,1.42],[.25,1.66],[.23,2.62]],
    closure:"wax", closureColor:0x762c28, closureRadius:.27, closureHeight:.38,
    labelWidth:1.02, labelHeight:1.24, labelY:.02, paper:"#d8d1bf", ink:"#252922", accent:"#7d342f", variant:"orbit",
  },
  campus: {
    glass: 0x6b3e20, segments: 10,
    profile: [[0,-1.24],[.5,-1.2],[.54,.82],[.5,1.08],[.31,1.38],[.24,2.34]],
    closure:"metal", closureColor:0x35342f, closureRadius:.27, closureHeight:.28,
    labelWidth:1.06, labelHeight:1.1, labelY:-.04, paper:"#d5ccb8", ink:"#302a23", accent:"#a35a2c", variant:"ledger",
  },
  mind: {
    glass: 0x252b2c, segments: 18,
    profile: [[0,-1.16],[.66,-1.1],[.7,.56],[.64,.76],[.48,1.04],[.31,1.28],[.29,2.02]],
    closure:"cork", closureColor:0x5b4331, closureRadius:.25, closureHeight:.32,
    labelWidth:1.18, labelHeight:.96, labelY:-.16, paper:"#aeb2ad", ink:"#202526", accent:"#48585b", variant:"index",
  },
  floating: {
    glass: 0x344b46, segments: 30,
    profile: [[0,-1.5],[.4,-1.45],[.44,1.22],[.38,1.4],[.25,1.62],[.19,1.78],[.18,2.84]],
    closure:"metal", closureColor:0x9b8c71, closureRadius:.21, closureHeight:.36,
    labelWidth:.88, labelHeight:1.42, labelY:.12, paper:"#cbd2cd", ink:"#263835", accent:"#52746e", variant:"tide",
  },
  zhiwei: {
    glass: 0x2c2433, segments: 32,
    profile: [[0,-1.38],[.5,-1.33],[.55,.7],[.5,1.02],[.36,1.34],[.23,1.56],[.2,2.52]],
    closure:"wax", closureColor:0x5f405f, closureRadius:.24, closureHeight:.43,
    labelWidth:.92, labelHeight:1.46, labelY:.08, paper:"#d8d1c8", ink:"#302b34", accent:"#75566f", variant:"literary",
  },
  archive: {
    glass: 0x352d1c, segments: 24,
    profile: [[0,-1.28],[.6,-1.22],[.63,.8],[.58,1.02],[.42,1.28],[.29,1.46],[.27,2.22]],
    closure:"cork", closureColor:0x826443, closureRadius:.25, closureHeight:.38,
    labelWidth:1.16, labelHeight:1.08, labelY:-.08, paper:"#b9aa8b", ink:"#2d281f", accent:"#704137", variant:"archive",
  },
};

const makeSurfaceTextures = (
  renderer: THREE.WebGLRenderer,
  kind: "masonry" | "stone" | "wood",
  seedOffset: number,
): VaultSurfaceTextures => {
  const size = 512;
  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  const roughnessCanvas = document.createElement("canvas");
  colorCanvas.width = bumpCanvas.width = roughnessCanvas.width = size;
  colorCanvas.height = bumpCanvas.height = roughnessCanvas.height = size;
  const colorContext = colorCanvas.getContext("2d")!;
  const bumpContext = bumpCanvas.getContext("2d")!;
  const roughnessContext = roughnessCanvas.getContext("2d")!;
  const colorData = colorContext.createImageData(size, size);
  const bumpData = bumpContext.createImageData(size, size);
  const roughnessData = roughnessContext.createImageData(size, size);
  let seed = 92821 + seedOffset;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let offset = 0; offset < colorData.data.length; offset += 4) {
    const pixel = offset / 4;
    const x = pixel % size;
    const y = Math.floor(pixel / size);
    const broad = kind === "wood"
      ? Math.sin(x * 0.031 + Math.sin(y * 0.017) * 2.2) * 8
      : (Math.sin(x * 0.021) + Math.sin(y * 0.019) + Math.sin((x + y) * 0.013)) * 3.2;
    const grain = Math.floor(174 + broad + random() * 24);
    const depth = Math.floor(112 + broad * 1.8 + random() * 64);
    const warm = kind === "wood" ? 12 : kind === "masonry" ? 5 : 0;
    colorData.data[offset] = Math.min(255, grain + warm);
    colorData.data[offset + 1] = Math.min(255, grain + (kind === "wood" ? 1 : 2));
    colorData.data[offset + 2] = Math.max(0, grain - warm);
    colorData.data[offset + 3] = 255;
    bumpData.data[offset] = depth;
    bumpData.data[offset + 1] = depth;
    bumpData.data[offset + 2] = depth;
    bumpData.data[offset + 3] = 255;
    const rough = Math.floor(188 + random() * 52 - broad);
    roughnessData.data[offset] = rough;
    roughnessData.data[offset + 1] = rough;
    roughnessData.data[offset + 2] = rough;
    roughnessData.data[offset + 3] = 255;
  }
  colorContext.putImageData(colorData, 0, 0);
  bumpContext.putImageData(bumpData, 0, 0);
  roughnessContext.putImageData(roughnessData, 0, 0);

  if (kind === "masonry") {
    const rowHeight = 62;
    const brickWidth = 112;
    for (let row = 0; row <= Math.ceil(size / rowHeight); row += 1) {
      const y = row * rowHeight;
      const shift = row % 2 ? -brickWidth / 2 : 0;
      colorContext.fillStyle = "rgba(34, 27, 21, .58)";
      colorContext.fillRect(0, y - 4, size, 7);
      bumpContext.fillStyle = "rgb(24 24 24)";
      bumpContext.fillRect(0, y - 5, size, 9);
      roughnessContext.fillStyle = "rgb(244 244 244)";
      roughnessContext.fillRect(0, y - 5, size, 9);
      for (let x = shift; x < size; x += brickWidth) {
        const faceLight = random() > .48;
        colorContext.fillStyle = faceLight
          ? `rgba(224, 208, 181, ${.025 + random() * .07})`
          : `rgba(34, 27, 21, ${.035 + random() * .08})`;
        colorContext.fillRect(x + 4, y + 4, brickWidth - 8, rowHeight - 8);
        colorContext.fillStyle = "rgba(30, 24, 19, .52)";
        colorContext.fillRect(x - 3, y, 6, rowHeight);
        bumpContext.fillStyle = "rgb(30 30 30)";
        bumpContext.fillRect(x - 4, y, 8, rowHeight);
        roughnessContext.fillStyle = "rgb(246 246 246)";
        roughnessContext.fillRect(x - 4, y, 8, rowHeight);
      }
    }
    for (let stain = 0; stain < 16; stain += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 24 + random() * 76;
      const gradient = colorContext.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(38, 47, 38, .24)");
      gradient.addColorStop(1, "rgba(38, 47, 38, 0)");
      colorContext.fillStyle = gradient;
      colorContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  } else if (kind === "stone") {
    colorContext.strokeStyle = "rgba(58, 53, 45, .34)";
    colorContext.lineWidth = 2;
    bumpContext.strokeStyle = "rgba(38, 38, 38, .72)";
    bumpContext.lineWidth = 3;
    for (let crack = 0; crack < 11; crack += 1) {
      let x = random() * size;
      let y = random() * size;
      colorContext.beginPath();
      bumpContext.beginPath();
      colorContext.moveTo(x, y);
      bumpContext.moveTo(x, y);
      for (let segment = 0; segment < 5; segment += 1) {
        x += (random() - .5) * 54;
        y += 24 + random() * 38;
        colorContext.lineTo(x, y);
        bumpContext.lineTo(x, y);
      }
      colorContext.stroke();
      bumpContext.stroke();
    }
    const edgeShade = colorContext.createLinearGradient(0, 0, size, 0);
    edgeShade.addColorStop(0, "rgba(30, 27, 22, .28)");
    edgeShade.addColorStop(.18, "rgba(30, 27, 22, 0)");
    edgeShade.addColorStop(.82, "rgba(30, 27, 22, 0)");
    edgeShade.addColorStop(1, "rgba(30, 27, 22, .28)");
    colorContext.fillStyle = edgeShade;
    colorContext.fillRect(0, 0, size, size);
  } else {
    for (let y = 8; y < size; y += 11 + Math.floor(random() * 9)) {
      colorContext.strokeStyle = `rgba(45, 25, 13, ${.16 + random() * .18})`;
      colorContext.lineWidth = 1 + random() * 2;
      colorContext.beginPath();
      colorContext.moveTo(0, y);
      colorContext.bezierCurveTo(size * .28, y + random() * 9, size * .64, y - random() * 8, size, y + random() * 5);
      colorContext.stroke();
      bumpContext.strokeStyle = "rgba(64, 64, 64, .42)";
      bumpContext.lineWidth = 1.2;
      bumpContext.beginPath();
      bumpContext.moveTo(0, y);
      bumpContext.lineTo(size, y + (random() - .5) * 5);
      bumpContext.stroke();
    }
    for (let knot = 0; knot < 5; knot += 1) {
      const x = random() * size;
      const y = random() * size;
      colorContext.strokeStyle = "rgba(42, 22, 13, .34)";
      colorContext.lineWidth = 4;
      colorContext.beginPath();
      colorContext.ellipse(x, y, 24 + random() * 18, 8 + random() * 7, random() * .4, 0, Math.PI * 2);
      colorContext.stroke();
    }
  }

  const color = new THREE.CanvasTexture(colorCanvas);
  color.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bumpCanvas);
  const roughness = new THREE.CanvasTexture(roughnessCanvas);
  for (const texture of [color, bump, roughness]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  const repeat = kind === "masonry" ? new THREE.Vector2(1.35, 2.7) : kind === "stone" ? new THREE.Vector2(1.25, 2.1) : new THREE.Vector2(.65, 3.4);
  color.repeat.copy(repeat);
  bump.repeat.copy(repeat);
  roughness.repeat.copy(repeat);
  return { color, bump, roughness };
};

const makeVaultTextures = (renderer: THREE.WebGLRenderer): VaultTextures => ({
  masonry: makeSurfaceTextures(renderer, "masonry", 0),
  stone: makeSurfaceTextures(renderer, "stone", 117),
  wood: makeSurfaceTextures(renderer, "wood", 249),
});

const makeSurfaceMaterial = (
  color: number,
  textures: VaultSurfaceTextures,
  roughness = 0.9,
  bumpScale = 0.075,
) =>
  new THREE.MeshStandardMaterial({
    color,
    map: textures.color,
    bumpMap: textures.bump,
    roughnessMap: textures.roughness,
    bumpScale,
    roughness,
    metalness: 0.02,
    envMapIntensity: 0.34,
  });

const markShadows = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
};

const makeLabelTexture = (name: string, index: number, design: VaultBottleDesign) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;
  const context = canvas.getContext("2d")!;
  context.fillStyle = design.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const seededNoise = (seed: number) => {
    const value = Math.sin(seed * 127.1 + index * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  context.strokeStyle = `${design.ink}88`;
  context.lineWidth = 2;
  context.strokeRect(18, 18, 476, 604);
  context.strokeStyle = `${design.accent}66`;
  context.lineWidth = 1;
  context.strokeRect(27, 27, 458, 586);
  context.fillStyle = `${design.ink}16`;
  for (let dot = 0; dot < 90; dot += 1) {
    const radius = .4 + seededNoise(dot + 300) * 1.2;
    context.beginPath();
    context.arc(22 + seededNoise(dot) * 468, 22 + seededNoise(dot + 120) * 596, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = "rgba(255,255,255,.045)";
  for (let y = 0; y < 640; y += 8) context.fillRect(0, y, 512, 1);
  context.strokeStyle = design.ink;
  context.fillStyle = design.ink;
  context.fillRect(38, 574, 436, 1);
  context.fillStyle = design.accent;
  context.beginPath();
  context.arc(256, 575, 6, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = `${design.accent}aa`;
  context.strokeRect(42, 108, 18, 34);
  context.strokeRect(452, 108, 18, 34);
  context.fillStyle = design.ink;
  context.textBaseline = "alphabetic";
  const title = name.toUpperCase();

  if (design.variant === "orbit") {
    context.fillStyle = design.accent;
    context.fillRect(18, 18, 12, 604);
    context.textAlign = "left";
    context.font = "600 20px Arial Narrow, sans-serif";
    context.fillText("RAIN_DUST / WORLD CELLAR", 42, 58);
    context.lineWidth = 2;
    context.beginPath(); context.arc(256, 216, 88, 0, Math.PI * 2); context.stroke();
    context.strokeStyle = design.accent;
    context.beginPath(); context.ellipse(256,216,138,48,-.34,0,Math.PI*2); context.stroke();
    context.fillStyle = design.accent;
    context.beginPath(); context.arc(355,168,10,0,Math.PI*2); context.fill();
    context.strokeStyle = `${design.accent}99`;
    context.lineWidth = 4;
    context.beginPath(); context.moveTo(116,300); context.lineTo(396,300); context.stroke();
    context.fillStyle = design.ink; context.textAlign = "center";
    context.font = "700 52px Arial Narrow, sans-serif";
    context.fillText("EARTH",256,390); context.fillText("ONLINE",256,446);
  } else if (design.variant === "ledger") {
    context.fillStyle = design.accent;
    context.fillRect(18,18,476,48);
    context.fillStyle = design.paper;
    for (let x=46;x<480;x+=38){context.beginPath();context.arc(x,42,4,0,Math.PI*2);context.fill();}
    context.strokeStyle = "rgba(48,42,35,.22)";
    context.lineWidth = 1;
    for (let x=38;x<512;x+=54){context.beginPath();context.moveTo(x,28);context.lineTo(x,612);context.stroke();}
    for (let y=30;y<640;y+=46){context.beginPath();context.moveTo(28,y);context.lineTo(484,y);context.stroke();}
    context.fillStyle = design.accent; context.fillRect(38,42,92,12);
    context.fillStyle = design.ink; context.textAlign="left";
    context.font="700 19px ui-monospace, monospace"; context.fillText("CAMPUS / CLAIM 02",38,92);
    context.font="700 48px Arial Narrow, sans-serif"; context.fillText("CAMPUS",38,292); context.fillText("KIT",38,346);
    context.save(); context.translate(384,390); context.rotate(-.11);
    context.strokeStyle=design.accent; context.lineWidth=7; context.strokeRect(-72,-34,144,68);
    context.fillStyle=design.accent; context.textAlign="center"; context.font="700 17px ui-monospace, monospace"; context.fillText("VERIFIED",0,6); context.restore();
    context.font="600 18px ui-monospace, monospace"; context.fillText("OCR · LOCAL · VERIFIED",38,548);
  } else if (design.variant === "index") {
    context.fillStyle = design.accent; context.fillRect(0,0,512,82);
    context.fillStyle = `${design.ink}26`;
    [102,178,254,330,406].forEach((x,i)=>context.fillRect(x,82,42,16+i*7));
    context.fillStyle = design.paper; context.textAlign="left";
    context.font="700 22px ui-monospace, monospace"; context.fillText("INDEX / 03",38,52);
    context.fillStyle = design.ink;
    context.font="700 52px Arial Narrow, sans-serif"; context.fillText("MIND",38,250); context.fillText("CACHE",38,308);
    context.strokeStyle=design.ink; context.strokeRect(38,356,436,126);
    context.font="600 17px ui-monospace, monospace";
    ["SEARCH","TAG","LOCAL"].forEach((word,i)=>{context.fillText(word,58+i*142,404);context.fillRect(58+i*142,430,72,3);});
  } else if (design.variant === "tide") {
    context.fillStyle=design.accent; context.fillRect(18,18,42,604);
    context.textAlign="left"; context.fillStyle=design.ink;
    context.font="600 18px Arial Narrow, sans-serif"; context.fillText("PORTABLE JOURNAL / 04",42,62);
    context.strokeStyle=design.accent; context.lineWidth=8;
    context.beginPath(); context.moveTo(-20,238); context.bezierCurveTo(120,155,212,320,532,198); context.stroke();
    context.lineWidth=2;
    [0,1,2].forEach((wave)=>{context.beginPath();context.moveTo(76,256+wave*26);context.bezierCurveTo(178,214+wave*22,284,314+wave*14,458,236+wave*24);context.stroke();});
    context.font="500 46px Georgia, serif"; context.fillText("Floating",42,384); context.fillText("Life",42,438);
    context.font="600 17px ui-monospace, monospace"; context.fillText("WORDS THAT TRAVEL",42,566);
  } else if (design.variant === "literary") {
    context.strokeStyle=design.accent; context.lineWidth=2;
    context.beginPath();context.moveTo(64,40);context.lineTo(64,600);context.moveTo(448,40);context.lineTo(448,600);context.stroke();
    context.textAlign="center"; context.fillStyle=design.ink;
    context.font="italic 18px Georgia, serif"; context.fillText("an immersive reading reserve",256,78);
    context.font="500 64px Georgia, serif"; context.fillText("ZHI",256,290);context.fillText("WEI",256,360);
    context.fillStyle=design.accent; context.fillRect(222,420,68,68);
    context.fillStyle=design.paper;context.font="700 19px Georgia, serif";context.fillText("05",256,462);
    context.strokeStyle=`${design.accent}aa`; context.lineWidth=1;
    context.beginPath(); context.arc(256,454,52,0,Math.PI*2); context.stroke();
    context.beginPath(); context.arc(256,454,58,0,Math.PI*2); context.stroke();
  } else {
    context.textAlign="left"; context.fillStyle=design.ink;
    context.font="700 18px ui-monospace, monospace"; context.fillText("RAIN_DUST PRIVATE RECORD",36,58);
    context.lineWidth=5;context.strokeRect(32,92,448,340);
    context.font="700 51px Georgia, serif"; context.fillText("ARCHIVE",54,260);
    context.fillStyle=design.accent;context.save();context.translate(356,360);context.rotate(-.12);context.strokeStyle=design.accent;context.lineWidth=8;context.strokeRect(-76,-38,152,76);context.font="700 20px ui-monospace, monospace";context.textAlign="center";context.fillText("OPEN / 06",0,8);context.restore();
  }

  context.fillStyle = design.ink;
  context.textAlign = "left";
  context.font = "600 17px ui-monospace, monospace";
  context.fillText(`RESERVE 0${index}`, 38, 604);
  context.textAlign = "right";
  context.fillText(title.slice(0, 24), 474, 604);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.userData.labelDataUrl = canvas.toDataURL("image/png");
  return texture;
};

const createBottle = (
  side: -1 | 1,
  name: string,
  index: number,
  design: VaultBottleDesign,
  labelTextures: THREE.Texture[],
): VaultBottle => {
  const bottle = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: design.glass,
    roughness: 0.19,
    metalness: 0,
    transmission: 0.2,
    transparent: true,
    opacity: 0.96,
    thickness: 0.72,
    clearcoat: 0.42,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.72,
  });
  const profile = design.profile.map(([radius,y]) => new THREE.Vector2(radius,y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, design.segments), glass);
  const topY = design.profile[design.profile.length - 1][1];
  const closure = new THREE.Mesh(
    new THREE.CylinderGeometry(design.closureRadius, design.closureRadius * (design.closure === "cork" ? .94 : 1), design.closureHeight, Math.max(12,design.segments)),
    new THREE.MeshStandardMaterial({ color: design.closureColor, roughness: design.closure === "metal" ? .38 : .8, metalness: design.closure === "metal" ? .42 : 0 }),
  );
  closure.position.y = topY + design.closureHeight / 2 - .03;
  if (design.closure === "wax") {
    const waxCollar = new THREE.Mesh(new THREE.CylinderGeometry(design.closureRadius * 1.08, design.closureRadius * 1.18, .18, design.segments), closure.material);
    waxCollar.position.y = topY - .02;
    bottle.add(waxCollar);
  }

  const labelTexture = makeLabelTexture(name, index, design);
  labelTextures.push(labelTexture);
  const maxRadius = Math.max(...design.profile.map(([radius]) => radius));
  const labelRadius = maxRadius + .014;
  const labelArc = Math.min(1.9, Math.max(.72, design.labelWidth / labelRadius));
  const labelCenterAngle = side === 1 ? -Math.PI / 2 : Math.PI / 2;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(
      labelRadius,
      labelRadius,
      design.labelHeight,
      32,
      1,
      true,
      labelCenterAngle - labelArc / 2,
      labelArc,
    ),
    new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.8,
      envMapIntensity: 0.18,
      transparent: true,
      alphaTest: 0.025,
    }),
  );
  label.position.y = design.labelY;
  label.renderOrder = 3;
  label.userData.labelDataUrl = labelTexture.userData.labelDataUrl;
  bottle.add(body, closure, label);
  markShadows(bottle);
  return { group: bottle, hitTargets: [body, closure, label], labelTarget: label };
};

const createAlcove = (
  side: -1 | 1,
  y: number,
  z: number,
  name: string,
  index: number,
  accent: string,
  design: VaultBottleDesign,
  textures: VaultTextures,
  labelTextures: THREE.Texture[],
  interactiveTargets: THREE.Object3D[],
  labelTargets: THREE.Object3D[],
  focus: Omit<VaultProjectFocus, "position" | "cameraPosition">,
) => {
  const group = new THREE.Group();
  const frameMaterial = makeSurfaceMaterial(0x756b5a, textures.masonry, 0.9, 0.08);
  const cavityMaterial = new THREE.MeshStandardMaterial({
    color: 0x17130f,
    map: textures.masonry.color,
    bumpMap: textures.masonry.bump,
    roughnessMap: textures.masonry.roughness,
    bumpScale: 0.045,
    roughness: 0.96,
    metalness: 0,
  });
  const wood = new THREE.MeshStandardMaterial({
    color: 0x6b4327,
    map: textures.wood.color,
    bumpMap: textures.wood.bump,
    roughnessMap: textures.wood.roughness,
    bumpScale: 0.055,
    roughness: 0.86,
    metalness: 0,
    envMapIntensity: 0.16,
  });

  const depth = 2.2;
  const width = 4.4;
  const height = 5.3;
  const xCenter = side * 4.95;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, height, width), cavityMaterial);
  back.position.set(xCenter + side * 1.02, y, z);
  const top = new THREE.Mesh(new THREE.BoxGeometry(depth, 0.48, width + 0.55), frameMaterial);
  const bottom = top.clone();
  top.position.set(xCenter + side * 0.35, y + height / 2, z);
  bottom.position.set(xCenter + side * 0.35, y - height / 2, z);
  const jambGeometry = new THREE.BoxGeometry(depth, height, 0.46);
  const frontJamb = new THREE.Mesh(jambGeometry, frameMaterial);
  const rearJamb = frontJamb.clone();
  frontJamb.position.set(xCenter + side * 0.35, y, z + width / 2);
  rearJamb.position.set(xCenter + side * 0.35, y, z - width / 2);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(depth - 0.18, 0.2, width - 0.38), wood);
  shelf.position.set(xCenter + side * 0.25, y - 1.65, z);
  group.add(back, top, bottom, frontJamb, rearJamb, shelf);

  const mainBottle = createBottle(side, name, index, design, labelTextures);
  mainBottle.group.position.set(xCenter - side * 0.12, y - 0.34, z);
  mainBottle.group.scale.setScalar(0.9);
  const focusData: VaultProjectFocus = {
    ...focus,
    position: new THREE.Vector3(xCenter - side * 0.73, y - 0.1, z),
    cameraPosition: new THREE.Vector3(side * 0.16, y + 0.08, z + 0.08),
  };
  mainBottle.hitTargets.forEach((target) => {
    target.userData.vaultFocus = focusData;
    interactiveTargets.push(target);
  });
  mainBottle.labelTarget.userData.vaultLabel = true;
  mainBottle.labelTarget.userData.vaultFocus = focusData;
  labelTargets.push(mainBottle.labelTarget);
  group.add(mainBottle.group);

  for (const offset of [-1.35, 1.35]) {
    const companion = createBottle(side, name, index, design, labelTextures);
    companion.group.position.set(xCenter + side * 0.18, y - 0.6, z + offset);
    companion.group.scale.setScalar(0.72);
    group.add(companion.group);
  }

  const glow = new THREE.PointLight(new THREE.Color(accent), 24, 8, 1.85);
  glow.position.set(xCenter - side * 1.25, y + 1.1, z);
  group.add(glow);
  markShadows(group);
  return group;
};

const createVaultCeiling = (path: THREE.CatmullRomCurve3, material: THREE.Material) => {
  const lengthSegments = 72;
  const widthSegments = 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3();
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  for (let zIndex = 0; zIndex <= lengthSegments; zIndex += 1) {
    const t = zIndex / lengthSegments;
    path.getPointAt(t, point);
    path.getTangentAt(t, tangent).normalize();
    right.crossVectors(tangent, up).normalize();
    for (let xIndex = 0; xIndex <= widthSegments; xIndex += 1) {
      const across = xIndex / widthSegments * 2 - 1;
      const crown = 5.72 - Math.pow(Math.abs(across), 1.7) * 0.68;
      vertex.copy(point).addScaledVector(right, across * 5.55).addScaledVector(up, crown);
      positions.push(vertex.x, vertex.y, vertex.z);
      uvs.push(t * 9, xIndex / widthSegments * 2.2);
    }
  }
  for (let zIndex = 0; zIndex < lengthSegments; zIndex += 1) {
    for (let xIndex = 0; xIndex < widthSegments; xIndex += 1) {
      const row = widthSegments + 1;
      const a = zIndex * row + xIndex;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const ceiling = new THREE.Mesh(geometry, material);
  ceiling.castShadow = true;
  ceiling.receiveShadow = true;
  return ceiling;
};

const createCeilingBeam = (point: THREE.Vector3, yaw: number, textures: VaultTextures) => {
  const group = new THREE.Group();
  const ribMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d5549,
    map: textures.masonry.color,
    bumpMap: textures.masonry.bump,
    roughnessMap: textures.masonry.roughness,
    bumpScale: 0.075,
    roughness: 0.97,
    metalness: 0,
    envMapIntensity: 0.08,
  });
  const ribGeometry = new THREE.BoxGeometry(0.93, 0.3, 0.52);
  const segmentCount = 12;
  for (let index = 0; index < segmentCount; index += 1) {
    const across = -1 + ((index + 0.5) / segmentCount) * 2;
    const x = across * 5.12;
    const crown = 5.63 - Math.pow(Math.abs(across), 1.7) * 0.66;
    const slope = across === 0
      ? 0
      : -Math.sign(across) * 0.66 * 1.7 * Math.pow(Math.abs(across), 0.7) / 5.12;
    const stone = new THREE.Mesh(ribGeometry, ribMaterial);
    stone.position.set(x, crown - 0.04, 0);
    stone.rotation.z = Math.atan(slope);
    group.add(stone);
  }
  group.position.copy(point);
  group.rotation.y = yaw;
  markShadows(group);
  return group;
};

const createVaultDeepContinuation = (
  path: THREE.CatmullRomCurve3,
  textures: VaultTextures,
  stepMaterial: THREE.MeshStandardMaterial,
) => {
  const group = new THREE.Group();
  const endPoint = path.getPointAt(1);
  const heading = path.getTangentAt(1).setY(0).normalize();
  const continuationPath = new THREE.CatmullRomCurve3([
    endPoint.clone(),
    endPoint.clone().addScaledVector(heading, 7.5).add(new THREE.Vector3(0.28, -2.15, 0)),
    endPoint.clone().addScaledVector(heading, 16.5).add(new THREE.Vector3(-0.42, -5.05, 0)),
    endPoint.clone().addScaledVector(heading, 27.5).add(new THREE.Vector3(0.3, -8.8, 0)),
  ]);

  const stepGeometry = new THREE.BoxGeometry(6.15, 0.12, 0.5);
  const stepCount = 44;
  const steps = new THREE.InstancedMesh(stepGeometry, stepMaterial, stepCount);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < stepCount; index += 1) {
    const t = index / (stepCount - 1);
    const point = continuationPath.getPointAt(t);
    const next = continuationPath.getPointAt(Math.min(1, t + 0.018));
    dummy.position.set(point.x, point.y - 2.3, point.z);
    dummy.rotation.y = Math.atan2(next.x - point.x, next.z - point.z);
    dummy.updateMatrix();
    steps.setMatrixAt(index, dummy.matrix);
    const variation = 0.82 + (((index + 54) * 17) % 9) * 0.015;
    steps.setColorAt(index, new THREE.Color(variation, variation * 0.965, variation * 0.9));
  }
  steps.instanceMatrix.needsUpdate = true;
  if (steps.instanceColor) steps.instanceColor.needsUpdate = true;
  steps.castShadow = true;
  steps.receiveShadow = true;
  group.add(steps);

  const wallMaterial = makeSurfaceMaterial(0x4b4339, textures.masonry, 0.99, 0.06);
  const wallGeometry = new THREE.BoxGeometry(0.58, 8.1, 4.8);
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3();
  for (let index = 0; index < 6; index += 1) {
    const t = (index + 0.45) / 6;
    const point = continuationPath.getPointAt(t);
    const tangent = continuationPath.getTangentAt(t).normalize();
    right.crossVectors(tangent, up).normalize();
    const yaw = Math.atan2(tangent.x, tangent.z);
    for (const side of [-1, 1] as const) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.copy(point).addScaledVector(right, side * 5.55);
      wall.position.y += 1.05;
      wall.rotation.y = yaw;
      wall.receiveShadow = true;
      group.add(wall);
    }
  }

  const ceilingMaterial = makeSurfaceMaterial(0x494137, textures.masonry, 0.99, 0.045);
  ceilingMaterial.side = THREE.DoubleSide;
  group.add(createVaultCeiling(continuationPath, ceilingMaterial));

  const rackMaterial = makeSurfaceMaterial(0x2d251f, textures.wood, 0.99, 0.025);
  const bottleMaterial = new THREE.MeshStandardMaterial({
    color: 0x171a16,
    roughness: 0.83,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
  });
  const uprightGeometry = new THREE.BoxGeometry(0.16, 3.7, 0.18);
  const shelfGeometry = new THREE.BoxGeometry(2.35, 0.12, 0.42);
  const bottleGeometry = new THREE.CylinderGeometry(0.11, 0.15, 1.15, 10);
  [0.48, 0.68, 0.84].forEach((t, rackIndex) => {
    const point = continuationPath.getPointAt(t);
    const tangent = continuationPath.getTangentAt(t).normalize();
    right.crossVectors(tangent, up).normalize();
    const yaw = Math.atan2(tangent.x, tangent.z);
    for (const side of [-1, 1] as const) {
      const rack = new THREE.Group();
      for (const x of [-1.08, 1.08]) {
        const upright = new THREE.Mesh(uprightGeometry, rackMaterial);
        upright.position.set(x, 0, 0);
        rack.add(upright);
      }
      for (const y of [-1.42, -0.25, 0.92]) {
        const shelf = new THREE.Mesh(shelfGeometry, rackMaterial);
        shelf.position.set(0, y, 0);
        rack.add(shelf);
        for (let bottleIndex = 0; bottleIndex < 5; bottleIndex += 1) {
          const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
          bottle.position.set(-0.82 + bottleIndex * 0.41, y + 0.62, 0.02);
          rack.add(bottle);
        }
      }
      rack.position.copy(point).addScaledVector(right, side * 4.72);
      rack.position.y += 0.2;
      rack.rotation.y = yaw + (side === -1 ? Math.PI / 2 : -Math.PI / 2);
      rack.scale.setScalar(1 - rackIndex * 0.09);
      group.add(rack);
    }
  });

  const hazeMaterial = new THREE.MeshBasicMaterial({
    color: 0x6f5b48,
    transparent: true,
    opacity: 0.055,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  [0.56, 0.76, 0.94].forEach((t, index) => {
    const point = continuationPath.getPointAt(t);
    const tangent = continuationPath.getTangentAt(t).normalize();
    const haze = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 8.6), hazeMaterial.clone());
    (haze.material as THREE.MeshBasicMaterial).opacity = 0.025 + index * 0.022;
    haze.position.copy(point);
    haze.position.y += 1.1;
    haze.rotation.y = Math.atan2(tangent.x, tangent.z);
    group.add(haze);
  });

  const deepGlow = new THREE.PointLight(0x9a6a45, 7.5, 15, 2.4);
  deepGlow.position.copy(continuationPath.getPointAt(0.72));
  deepGlow.position.y += 0.15;
  group.add(deepGlow);

  markShadows(group);
  return group;
};

export const mountProjectVault3D = (
  root: HTMLElement,
  canvas: HTMLCanvasElement,
): ProjectVault3D | null => {
  const deviceNavigator = navigator as Navigator & { deviceMemory?: number };
  const lowPowerDevice =
    (deviceNavigator.deviceMemory ?? 8) <= 4 ||
    (deviceNavigator.hardwareConcurrency ?? 8) <= 4;
  const pixelRatioCap = lowPowerDevice ? 1 : 1.25;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lowPowerDevice,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  root.dataset.vaultRenderer = "pending";
  root.dataset.vaultQuality = lowPowerDevice ? "balanced" : "high";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x17120f);
  scene.fog = new THREE.FogExp2(0x17120f, 0.0145);
  scene.environmentIntensity = 0.27;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.035);
  scene.environment = environmentRenderTarget.texture;
  pmremGenerator.dispose();

  const textures = makeVaultTextures(renderer);
  const labelTextures: THREE.Texture[] = [];
  const interactiveTargets: THREE.Object3D[] = [];
  const labelTargets: THREE.Object3D[] = [];
  const camera = new THREE.PerspectiveCamera(61, 1, 0.08, 100);
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 3.5, 8),
      new THREE.Vector3(0, 2.25, 2),
      new THREE.Vector3(-0.24, 0.2, -6),
      new THREE.Vector3(0.45, -2.25, -14),
      new THREE.Vector3(0.08, -4.8, -22),
      new THREE.Vector3(-0.42, -7.4, -31),
    ],
    false,
    "catmullrom",
    0.38,
  );

  const ambient = new THREE.HemisphereLight(0x918f86, 0x1b110b, 0.72);
  const cellarBounce = new THREE.AmbientLight(0x7f6c58, 0.31);
  const key = new THREE.SpotLight(0xd4a466, 164, 42, Math.PI / 5.6, 0.78, 1.65);
  key.position.set(-1.8, 6.2, 8.2);
  key.target.position.set(0, -3.5, -18);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 48;
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 3;
  const entranceFill = new THREE.DirectionalLight(0x74828a, 2.15);
  entranceFill.position.set(4.5, 5.5, 11);
  scene.add(ambient, cellarBounce, key, key.target, entranceFill);

  const glitchTarget = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
    stencilBuffer: false,
  });
  const glitchUniforms = {
    tDiffuse: { value: glitchTarget.texture },
    uIntensity: { value: 0 },
    uSeed: { value: 0.37 },
    uSliceY: { value: new THREE.Vector4(-1, -1, -1, -1) },
    uSliceHeight: { value: new THREE.Vector4(0, 0, 0, 0) },
    uSliceX: { value: new THREE.Vector4(0, 0, 0, 0) },
    uSliceWidth: { value: new THREE.Vector4(0, 0, 0, 0) },
    uSliceShift: { value: new THREE.Vector4(0, 0, 0, 0) },
    uRgbShift: { value: new THREE.Vector4(0, 0, 0, 0) },
  };
  const glitchMaterial = new THREE.ShaderMaterial({
    uniforms: glitchUniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uIntensity;
      uniform float uSeed;
      uniform vec4 uSliceY;
      uniform vec4 uSliceHeight;
      uniform vec4 uSliceX;
      uniform vec4 uSliceWidth;
      uniform vec4 uSliceShift;
      uniform vec4 uRgbShift;
      varying vec2 vUv;

      float rectMask(vec2 uv, float y, float height, float x, float width) {
        float vertical = step(abs(uv.y - y), height * 0.5);
        float horizontal = step(x, uv.x) * step(uv.x, x + width);
        return vertical * horizontal;
      }

      float edgeMask(vec2 uv, float y, float height, float x, float width) {
        float yEdge = 1.0 - smoothstep(0.0, max(height * 0.18, 0.0015), abs(abs(uv.y - y) - height * 0.5));
        float xDistance = min(abs(uv.x - x), abs(uv.x - (x + width)));
        float xEdge = 1.0 - smoothstep(0.0, 0.006, xDistance);
        return max(yEdge, xEdge);
      }

      void main() {
        vec2 uv = vUv;
        vec4 original = texture2D(tDiffuse, uv);
        float mask0 = rectMask(uv, uSliceY.x, uSliceHeight.x, uSliceX.x, uSliceWidth.x);
        float mask1 = rectMask(uv, uSliceY.y, uSliceHeight.y, uSliceX.y, uSliceWidth.y);
        float mask2 = rectMask(uv, uSliceY.z, uSliceHeight.z, uSliceX.z, uSliceWidth.z);
        float mask3 = rectMask(uv, uSliceY.w, uSliceHeight.w, uSliceX.w, uSliceWidth.w);
        float tear = clamp(mask0 + mask1 + mask2 + mask3, 0.0, 1.0);

        float displacement = mask0 * uSliceShift.x + mask1 * uSliceShift.y +
          mask2 * uSliceShift.z + mask3 * uSliceShift.w;
        float rgbOffset = mask0 * uRgbShift.x + mask1 * uRgbShift.y +
          mask2 * uRgbShift.z + mask3 * uRgbShift.w;
        float edge = max(
          max(mask0 * edgeMask(uv, uSliceY.x, uSliceHeight.x, uSliceX.x, uSliceWidth.x),
              mask1 * edgeMask(uv, uSliceY.y, uSliceHeight.y, uSliceX.y, uSliceWidth.y)),
          max(mask2 * edgeMask(uv, uSliceY.z, uSliceHeight.z, uSliceX.z, uSliceWidth.z),
              mask3 * edgeMask(uv, uSliceY.w, uSliceHeight.w, uSliceX.w, uSliceWidth.w))
        );

        vec2 shiftedUv = vec2(clamp(uv.x + displacement * uIntensity, 0.0, 1.0), uv.y);
        vec4 shifted = texture2D(tDiffuse, shiftedUv);
        float channel = rgbOffset * uIntensity;
        vec3 split = vec3(
          texture2D(tDiffuse, vec2(clamp(shiftedUv.x + channel, 0.0, 1.0), shiftedUv.y)).r,
          shifted.g,
          texture2D(tDiffuse, vec2(clamp(shiftedUv.x - channel, 0.0, 1.0), shiftedUv.y)).b
        );

        float scan = step(0.84, fract((uv.y + uSeed * 0.17) * 460.0)) * tear;
        vec3 displaced = mix(shifted.rgb, split, edge * 0.9 + scan * 0.22);
        vec3 color = mix(original.rgb, displaced, tear * uIntensity);
        gl_FragColor = vec4(color, original.a);
        #include <colorspace_fragment>
      }
    `,
  });
  const glitchScene = new THREE.Scene();
  const glitchCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const glitchQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glitchMaterial);
  glitchScene.add(glitchQuad);

  const stepsMaterial = makeSurfaceMaterial(0xc4baa4, textures.stone, 0.94, 0.055);
  stepsMaterial.vertexColors = true;
  stepsMaterial.emissive.setHex(0x8b765b);
  stepsMaterial.emissiveMap = textures.stone.color;
  stepsMaterial.emissiveIntensity = 0.2;
  const stepGeometry = new THREE.BoxGeometry(6.6, 0.14, 0.42);
  const stepCount = 54;
  const steps = new THREE.InstancedMesh(stepGeometry, stepsMaterial, stepCount);
  const shoulderMaterial = makeSurfaceMaterial(0x746a59, textures.stone, 0.97, 0.045);
  shoulderMaterial.vertexColors = true;
  shoulderMaterial.emissive.setHex(0x453a2f);
  shoulderMaterial.emissiveMap = textures.stone.color;
  shoulderMaterial.emissiveIntensity = 0.09;
  const shoulderGeometry = new THREE.BoxGeometry(0.98, 0.11, 0.42);
  const stepShoulders = new THREE.InstancedMesh(shoulderGeometry, shoulderMaterial, stepCount * 2);
  steps.castShadow = true;
  steps.receiveShadow = true;
  stepShoulders.castShadow = true;
  stepShoulders.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const stairRight = new THREE.Vector3();
  for (let index = 0; index < stepCount; index += 1) {
    const t = 0.04 + (index / (stepCount - 1)) * 0.96;
    const point = path.getPointAt(t);
    const next = path.getPointAt(Math.min(1, t + 0.012));
    const yaw = Math.atan2(next.x - point.x, next.z - point.z);
    dummy.position.set(point.x, point.y - 2.28, point.z);
    dummy.rotation.y = yaw;
    dummy.updateMatrix();
    steps.setMatrixAt(index, dummy.matrix);
    const variation = 0.82 + ((index * 17) % 9) * 0.015;
    steps.setColorAt(index, new THREE.Color(variation, variation * 0.965, variation * 0.9));
    stairRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
    for (const side of [-1, 1] as const) {
      dummy.position.copy(point).addScaledVector(stairRight, side * 3.79);
      dummy.position.y -= 2.295;
      dummy.rotation.y = yaw;
      dummy.updateMatrix();
      const shoulderIndex = index * 2 + (side === -1 ? 0 : 1);
      stepShoulders.setMatrixAt(shoulderIndex, dummy.matrix);
      const shoulderTone = 0.57 + ((index * 11 + shoulderIndex) % 7) * 0.012;
      stepShoulders.setColorAt(
        shoulderIndex,
        new THREE.Color(shoulderTone, shoulderTone * 0.94, shoulderTone * 0.84),
      );
    }
  }
  steps.instanceMatrix.needsUpdate = true;
  if (steps.instanceColor) steps.instanceColor.needsUpdate = true;
  stepShoulders.instanceMatrix.needsUpdate = true;
  if (stepShoulders.instanceColor) stepShoulders.instanceColor.needsUpdate = true;
  scene.add(steps, stepShoulders);

  const corridorFill = new THREE.SpotLight(0x9f8464, 58, 36, Math.PI / 4.1, 0.88, 1.72);
  corridorFill.position.set(0, 4.6, 7.6);
  corridorFill.target.position.set(0, -4.2, -24);
  scene.add(corridorFill, corridorFill.target);

  const ceilingMaterial = makeSurfaceMaterial(0x62594b, textures.masonry, 0.97, 0.075);
  ceilingMaterial.side = THREE.DoubleSide;
  scene.add(createVaultCeiling(path, ceilingMaterial));
  scene.add(createVaultDeepContinuation(path, textures, stepsMaterial));

  const endPoint = path.getPointAt(1);
  const endTangent = path.getTangentAt(1).normalize();
  const endLight = new THREE.PointLight(0x9a6845, 18, 13, 2.1);
  endLight.position.copy(endPoint).addScaledVector(endTangent, 2.8);
  endLight.position.y += 0.35;
  scene.add(endLight);

  const wallMaterial = makeSurfaceMaterial(0x675d4e, textures.masonry, 0.95, 0.105);
  const wallGeometry = new THREE.BoxGeometry(0.55, 9.7, 5.1);
  for (let index = 0; index < 13; index += 1) {
    const t = (index + 0.5) / 13;
    const point = path.getPointAt(t);
    for (const side of [-1, 1] as const) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(point.x + side * 5.7, point.y + 1.28, point.z);
      wall.receiveShadow = true;
      scene.add(wall);
    }
  }

  [0.16, 0.45, 0.74].forEach((t) => {
    const point = path.getPointAt(t);
    const tangent = path.getTangentAt(t);
    scene.add(createCeilingBeam(point, Math.atan2(tangent.x, tangent.z), textures));
  });

  [0.12, 0.36, 0.61, 0.84].forEach((t, index) => {
    const point = path.getPointAt(t);
    const lamp = new THREE.PointLight(index % 2 ? 0xb87545 : 0xc89159, 11.5, 11, 2.15);
    lamp.position.set(point.x + (index % 2 ? 2.8 : -2.8), point.y + 3.2, point.z);
    scene.add(lamp);
  });

  const reserves = [
    { id: "earth", t: 0.18, side: -1 as const, name: "Earth Online", accent: "#8b342d", kicker: "INTERACTIVE WORLD", summary: "把现实人生包装成持续在线的 3D 世界。", details: "THREE.JS · WEBGL · INDEPENDENT BUILD" },
    { id: "campus", t: 0.23, side: 1 as const, name: "Campus Kit", accent: "#6c432a", kicker: "LOCAL AUTOMATION", summary: "整理电子票据，并生成可复核的报销资料。", details: "PYTHON · OCR · WORKFLOW" },
    { id: "mind", t: 0.46, side: -1 as const, name: "Mind Cache", accent: "#564638", kicker: "LOCAL-FIRST ARCHIVE", summary: "在浏览器中保存、搜索与归档想法。", details: "JAVASCRIPT · SEARCH · LOCAL STORAGE" },
    { id: "floating", t: 0.52, side: 1 as const, name: "Floating Life", accent: "#7b4b35", kicker: "PORTABLE JOURNAL", summary: "为文字摘录与个人感悟设计的移动端积累本。", details: "PWA · CAPACITOR · PERSONAL TOOL" },
    { id: "zhiwei", t: 0.73, side: -1 as const, name: "Zhi Wei", accent: "#493e4d", kicker: "IMMERSIVE NOVEL", summary: "以沉浸式阅读为方向的可部署原型。", details: "NARRATIVE · INTERACTION · PROTOTYPE" },
    { id: "archive", t: 0.79, side: 1 as const, name: "Archive", accent: "#6d392e", kicker: "GITHUB RESERVE", summary: "持续维护的小型实验与工程存档。", details: "OPEN SOURCE · ITERATION · ARCHIVE" },
  ];
  reserves.forEach((reserve, index) => {
    const point = path.getPointAt(reserve.t);
    scene.add(
      createAlcove(
        reserve.side,
        point.y + 0.2,
        point.z,
        reserve.name,
        index + 1,
        reserve.accent,
        bottleDesigns[reserve.id],
        textures,
        labelTextures,
        interactiveTargets,
        labelTargets,
        reserve,
      ),
    );
  });

  const inspectionTarget = new THREE.Object3D();
  const inspectionLight = new THREE.SpotLight(0xf0d9aa, 0, 18, Math.PI / 13, 0.96, 1.5);
  inspectionLight.target = inspectionTarget;
  scene.add(inspectionLight, inspectionTarget);

  let targetProgress = 0;
  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let pointerActive = false;
  let activeFocus: VaultProjectFocus | null = null;
  let hoverFocus: VaultProjectFocus | null = null;
  let hoverFocusStartedAt = 0;
  let focusAmount = 0;
  let labelHoverStartedAt = 0;
  let labelHoverLostAt = 0;
  let detailVisible = false;
  let disposed = false;
  let previousTime = performance.now();
  const forcedMotion = new URLSearchParams(location.search).get("motion") === "force";
  const reduceGlitch = matchMedia("(prefers-reduced-motion: reduce)").matches && !forcedMotion;
  const nextGlitchDelay = () => 8000 + Math.random() * 7000;
  let glitchStartsAt = performance.now() + (forcedMotion ? 1800 + Math.random() * 900 : nextGlitchDelay());
  let glitchEndsAt = 0;
  let glitchStartedAt = 0;
  let glitchDuration = 200;
  let glitchPulseIndex = -1;
  let glitchPulseWindows: Array<[number, number]> = [];
  const pointerNdc = new THREE.Vector3();
  const pointerRayNdc = new THREE.Vector2();
  const inspectionDirection = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const baseCameraPosition = new THREE.Vector3();
  const baseLookTarget = new THREE.Vector3();
  const resolvedLookTarget = new THREE.Vector3();
  const focusCard = root.querySelector<HTMLElement>("[data-vault-focus-card]");
  const focusKicker = focusCard?.querySelector<HTMLElement>("[data-vault-focus-kicker]");
  const focusName = focusCard?.querySelector<HTMLElement>("[data-vault-focus-name]");
  const focusSummary = focusCard?.querySelector<HTMLElement>("[data-vault-focus-summary]");
  const focusDetails = focusCard?.querySelector<HTMLElement>("[data-vault-focus-details]");
  const focusClose = root.querySelector<HTMLButtonElement>("[data-vault-focus-close]");
  const focusIntent = root.querySelector<HTMLElement>("[data-vault-focus-intent]");

  const configureGlitchSlices = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const sliceCount = 2 + Math.floor(Math.random() * 3);
    const ys = [-1, -1, -1, -1];
    const heights = [0, 0, 0, 0];
    const xs = [0, 0, 0, 0];
    const widths = [0, 0, 0, 0];
    const shifts = [0, 0, 0, 0];
    const rgbShifts = [0, 0, 0, 0];
    const primarySlice = Math.floor(Math.random() * sliceCount);
    const rarePrimary = Math.random() < 0.16;

    for (let index = 0; index < sliceCount; index += 1) {
      const nearFull = index === primarySlice && Math.random() < 0.12;
      const sliceWidth = nearFull ? 0.82 + Math.random() * 0.14 : 0.35 + Math.random() * 0.45;
      const displacementPixels = index === primarySlice && rarePrimary
        ? 32 + Math.random() * 14
        : 8 + Math.random() * 16;
      const direction = Math.random() > 0.5 ? 1 : -1;
      ys[index] = 0.12 + Math.random() * 0.76;
      heights[index] = (10 + Math.random() * 34) / height;
      xs[index] = Math.random() * (1 - sliceWidth);
      widths[index] = sliceWidth;
      shifts[index] = direction * displacementPixels / width;
      rgbShifts[index] = direction * (3 + Math.random() * 5) / width;
    }

    glitchUniforms.uSeed.value = Math.random();
    glitchUniforms.uSliceY.value.set(ys[0], ys[1], ys[2], ys[3]);
    glitchUniforms.uSliceHeight.value.set(heights[0], heights[1], heights[2], heights[3]);
    glitchUniforms.uSliceX.value.set(xs[0], xs[1], xs[2], xs[3]);
    glitchUniforms.uSliceWidth.value.set(widths[0], widths[1], widths[2], widths[3]);
    glitchUniforms.uSliceShift.value.set(shifts[0], shifts[1], shifts[2], shifts[3]);
    glitchUniforms.uRgbShift.value.set(rgbShifts[0], rgbShifts[1], rgbShifts[2], rgbShifts[3]);
  };

  const beginGlitchEvent = (time: number) => {
    glitchDuration = 160 + Math.random() * 100;
    glitchStartedAt = time;
    glitchEndsAt = time + glitchDuration;
    glitchStartsAt = glitchEndsAt + nextGlitchDelay();
    glitchPulseIndex = -1;
    glitchPulseWindows = Math.random() < 0.56
      ? [[0.03, 0.22], [0.43, 0.62], [0.76, 0.94]]
      : [[0.06, 0.3], [0.62, 0.9]];
  };

  const clearFocusIntent = () => {
    hoverFocus = null;
    hoverFocusStartedAt = 0;
    delete root.dataset.vaultFocusIntent;
    focusIntent?.style.setProperty("--intent-progress", "0");
  };

  const hideFocusDetails = () => {
    detailVisible = false;
    labelHoverStartedAt = 0;
    labelHoverLostAt = 0;
    focusCard?.setAttribute("aria-hidden", "true");
    focusCard?.style.setProperty("--lens-u", "0");
    focusCard?.style.setProperty("--lens-v", "0");
  };

  const revealFocusDetails = () => {
    if (!focusCard || !activeFocus || detailVisible) return;
    detailVisible = true;
    focusCard.setAttribute("aria-hidden", "false");
  };

  const presentFocus = (focus: VaultProjectFocus | null) => {
    if (activeFocus === focus && focus) return;
    clearFocusIntent();
    hideFocusDetails();
    activeFocus = focus;
    if (!focusCard) return;
    if (!focus) {
      delete root.dataset.vaultFocusSide;
      delete root.dataset.vaultFocusProject;
      focusCard.style.removeProperty("--vault-label-accent");
      return;
    }
    if (focusKicker) focusKicker.textContent = focus.kicker;
    if (focusName) focusName.textContent = focus.name;
    if (focusSummary) focusSummary.textContent = focus.summary;
    if (focusDetails) focusDetails.textContent = focus.details;
    root.dataset.vaultFocusSide = focus.side === 1 ? "right" : "left";
    root.dataset.vaultFocusProject = focus.id;
    focusCard.style.setProperty("--vault-label-accent", focus.accent);
  };

  const clearFocus = () => {
    clearFocusIntent();
    hideFocusDetails();
    activeFocus = null;
    delete root.dataset.vaultFocusSide;
    delete root.dataset.vaultFocusProject;
    focusCard?.style.removeProperty("--vault-label-accent");
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const isEscape = event.key === "Escape" || event.key === "Esc" || event.code === "Escape";
    if (!isEscape || (!activeFocus && !root.dataset.vaultFocusProject)) return;
    event.preventDefault();
    event.stopPropagation();
    clearFocus();
  };

  const readScroll = () => {
    const rect = root.getBoundingClientRect();
    targetProgress = clamp01(-rect.top / Math.max(1, rect.height - innerHeight));
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      pointerActive = false;
      clearFocusIntent();
      return;
    }
    pointerActive = true;
    const lensRadius = Math.min(126, Math.max(94, innerWidth * .09));
    focusCard?.style.setProperty("--lens-x", `${Math.min(innerWidth - lensRadius, Math.max(lensRadius, event.clientX))}px`);
    focusCard?.style.setProperty("--lens-y", `${Math.min(innerHeight - lensRadius, Math.max(lensRadius, event.clientY))}px`);
    focusIntent?.style.setProperty("--intent-x", `${event.clientX}px`);
    focusIntent?.style.setProperty("--intent-y", `${event.clientY}px`);
    focusIntent?.style.setProperty("--intent-offset-x", event.clientX > innerWidth - 150 ? "-138px" : "14px");
    focusIntent?.style.setProperty("--intent-offset-y", event.clientY > innerHeight - 54 ? "-30px" : "12px");
    targetPointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.16;
    targetPointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.1;
    pointerNdc.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      0.35,
    );
    pointerRayNdc.set(pointerNdc.x, pointerNdc.y);
  };
  const onPointerLeave = () => {
    targetPointerX = 0;
    targetPointerY = 0;
    pointerActive = false;
    clearFocusIntent();
    hideFocusDetails();
  };

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatioCap));
    renderer.setSize(width, height, false);
    glitchTarget.setSize(
      Math.max(1, Math.floor(width * Math.min(devicePixelRatio, 1))),
      Math.max(1, Math.floor(height * Math.min(devicePixelRatio, 1))),
    );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const render = (time: number) => {
    if (disposed) return;
    const dt = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    progress += (targetProgress - progress) * (1 - Math.exp(-dt * 5.1));
    pointerX += (targetPointerX - pointerX) * (1 - Math.exp(-dt * 4.2));
    pointerY += (targetPointerY - pointerY) * (1 - Math.exp(-dt * 4.2));
    const pathProgress = clamp01(progress * 0.94);
    const point = path.getPointAt(pathProgress);
    const look = path.getPointAt(clamp01(pathProgress + 0.072));
    baseCameraPosition.set(point.x + pointerX, point.y + 1.02 - pointerY, point.z);
    baseLookTarget.set(look.x, look.y + 0.45, look.z);

    if (pointerActive && !activeFocus) {
      raycaster.setFromCamera(pointerRayNdc, camera);
      const hit = raycaster.intersectObjects(interactiveTargets, false)[0];
      const hitFocus = hit?.object.userData.vaultFocus as VaultProjectFocus | undefined;
      if (!hitFocus) {
        clearFocusIntent();
      } else {
        if (hoverFocus?.id !== hitFocus.id) {
          hoverFocus = hitFocus;
          hoverFocusStartedAt = time;
        }
        const intentProgress = clamp01((time - hoverFocusStartedAt) / 560);
        root.dataset.vaultFocusIntent = "true";
        focusIntent?.style.setProperty("--intent-progress", intentProgress.toFixed(3));
        if (intentProgress >= 1) presentFocus(hitFocus);
      }
    } else if (activeFocus) {
      clearFocusIntent();
    }

    if (pointerActive && activeFocus && focusAmount > .68) {
      raycaster.setFromCamera(pointerRayNdc, camera);
      const labelHit = raycaster.intersectObjects(labelTargets, false)[0];
      const labelFocus = labelHit?.object.userData.vaultFocus as VaultProjectFocus | undefined;
      if (labelFocus?.id === activeFocus.id) {
        const labelUv = labelHit.uv;
        const lensU = labelUv ? (labelUv.x - .5) * 2 : 0;
        const lensV = labelUv ? (labelUv.y - .5) * 2 : 0;
        focusCard?.style.setProperty("--lens-u", lensU.toFixed(3));
        focusCard?.style.setProperty("--lens-v", lensV.toFixed(3));
        const labelImage = labelHit.object.userData.labelDataUrl as string | undefined;
        if (labelImage) focusCard?.style.setProperty("--vault-label-image", `url("${labelImage}")`);
        labelHoverLostAt = 0;
        if (!labelHoverStartedAt) labelHoverStartedAt = time;
        if (time - labelHoverStartedAt >= 720) revealFocusDetails();
      } else {
        labelHoverStartedAt = 0;
        if (detailVisible) {
          if (!labelHoverLostAt) labelHoverLostAt = time;
          if (time - labelHoverLostAt >= 180) hideFocusDetails();
        }
      }
    } else if (!detailVisible) {
      labelHoverStartedAt = 0;
    }

    const desiredFocusAmount = activeFocus ? 1 : 0;
    const focusSpeed = activeFocus ? 2.15 : 1.65;
    focusAmount += (desiredFocusAmount - focusAmount) * (1 - Math.exp(-dt * focusSpeed));
    camera.position.copy(baseCameraPosition);
    resolvedLookTarget.copy(baseLookTarget);
    if (activeFocus) {
      camera.position.lerp(activeFocus.cameraPosition, focusAmount * 0.88);
      resolvedLookTarget.lerp(activeFocus.position, focusAmount);
    }
    camera.lookAt(resolvedLookTarget);

    inspectionLight.position.copy(camera.position);
    if (activeFocus) {
      inspectionTarget.position.copy(activeFocus.position);
    } else if (pointerActive) {
      inspectionDirection.copy(pointerNdc).unproject(camera).sub(camera.position).normalize();
      inspectionTarget.position.copy(camera.position).addScaledVector(inspectionDirection, 12);
    } else {
      inspectionTarget.position.set(look.x, look.y + 0.2, look.z);
    }
    const desiredInspection = activeFocus ? 92 : pointerActive ? 118 : 0;
    inspectionLight.intensity +=
      (desiredInspection - inspectionLight.intensity) * (1 - Math.exp(-dt * 7.5));
    let glitchIntensity = 0;
    if (!reduceGlitch) {
      if (time >= glitchStartsAt && time >= glitchEndsAt) {
        beginGlitchEvent(time);
      }
      if (time < glitchEndsAt) {
        const eventPhase = clamp01((time - glitchStartedAt) / glitchDuration);
        const pulseIndex = glitchPulseWindows.findIndex(([start, end]) => eventPhase >= start && eventPhase <= end);
        if (pulseIndex >= 0) {
          if (pulseIndex !== glitchPulseIndex) {
            glitchPulseIndex = pulseIndex;
            configureGlitchSlices();
          }
          const [pulseStart, pulseEnd] = glitchPulseWindows[pulseIndex];
          const pulsePhase = clamp01((eventPhase - pulseStart) / (pulseEnd - pulseStart));
          glitchIntensity = 0.78 + Math.sin(pulsePhase * Math.PI) * 0.22;
        }
      } else if (activeFocus || Math.abs(targetProgress - progress) > 0.075) {
        glitchStartsAt = Math.max(time + 650, glitchStartsAt - dt * 350);
      }
    }
    glitchUniforms.uIntensity.value = glitchIntensity;
    if (glitchIntensity > 0.001) {
      renderer.setRenderTarget(glitchTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(glitchScene, glitchCamera);
    } else {
      renderer.render(scene, camera);
    }
    if (root.dataset.vaultRenderer !== "webgl") {
      root.dataset.vaultRenderer = "webgl";
      delete root.dataset.vaultBooting;
    }
  };

  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", resize, { passive: true });
  addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("keydown", onKeyDown, true);
  document.documentElement.addEventListener("mouseleave", onPointerLeave);
  focusClose?.addEventListener("click", clearFocus);
  const onVisibilityChange = () => {
    if (disposed) return;
    if (document.hidden) {
      renderer.setAnimationLoop(null);
      return;
    }
    previousTime = performance.now();
    renderer.setAnimationLoop(render);
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  readScroll();
  resize();
  onVisibilityChange();

  return {
    destroy: () => {
      if (disposed) return;
      disposed = true;
      removeEventListener("scroll", readScroll);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKeyDown, true);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      focusClose?.removeEventListener("click", clearFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      presentFocus(null);
      renderer.setAnimationLoop(null);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      Object.values(textures).forEach((surface) => {
        surface.color.dispose();
        surface.bump.dispose();
        surface.roughness.dispose();
      });
      labelTextures.forEach((texture) => texture.dispose());
      glitchQuad.geometry.dispose();
      glitchMaterial.dispose();
      glitchTarget.dispose();
      environmentRenderTarget.dispose();
      renderer.dispose();
      delete root.dataset.vaultRenderer;
    },
  };
};
