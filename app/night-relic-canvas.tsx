"use client";

import { type MutableRefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
  EARTH_PROJECT,
  RELIC_TOPOLOGY,
  type RelicFragmentTopology,
  type Vec3Tuple,
} from "./relic-topology";

type NightRelicCanvasProps = {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onFallback: () => void;
};

type FragmentRuntime = {
  mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.Material[]>;
  outer: THREE.MeshStandardMaterial;
  inner: THREE.MeshStandardMaterial;
  assembledPosition: THREE.Vector3;
  topology: RelicFragmentTopology;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const segment = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const toVector = ([x, y, z]: Vec3Tuple) => new THREE.Vector3(x, y, z);

function createFragmentGeometry(topology: RelicFragmentTopology) {
  const centroid = topology.polygon.reduce(
    (total, [x, y]) => ({ x: total.x + x, y: total.y + y }),
    { x: 0, y: 0 },
  );
  centroid.x /= topology.polygon.length;
  centroid.y /= topology.polygon.length;

  const worldCentroid = new THREE.Vector3(
    (centroid.x / 100 - 0.5) * 12,
    (0.5 - centroid.y / 100) * 6.75,
    0,
  );

  const shape = new THREE.Shape();
  topology.polygon.forEach(([x, y], index) => {
    const localX = (x / 100 - 0.5) * 12 - worldCentroid.x;
    const localY = (0.5 - y / 100) * 6.75 - worldCentroid.y;
    if (index === 0) shape.moveTo(localX, localY);
    else shape.lineTo(localX, localY);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: topology.thickness,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.035,
    bevelThickness: 0.04,
    curveSegments: 1,
  });

  const positions = geometry.getAttribute("position");
  const uvs = geometry.getAttribute("uv");
  for (let index = 0; index < positions.count; index += 1) {
    const worldX = positions.getX(index) + worldCentroid.x;
    const worldY = positions.getY(index) + worldCentroid.y;
    uvs.setXY(index, worldX / 12 + 0.5, 0.5 - worldY / 6.75);
  }
  uvs.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return { geometry, worldCentroid };
}

function createErosionMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uVisibility: { value: 0 },
      uTime: { value: 0 },
      uVelocity: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uProgress;
      uniform float uVisibility;
      uniform float uTime;
      uniform float uVelocity;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.03 + 7.17;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float grain = fbm(vUv * vec2(6.0, 4.0) + uTime * 0.018);
        float filaments = sin(vUv.x * 42.0 + grain * 10.0) * 0.035;
        float threshold = uProgress * 1.16 + (0.12 - edge) * 0.62 + filaments;
        float field = smoothstep(grain - 0.07, grain + 0.07, threshold);
        float band = smoothstep(0.0, 0.045, abs(grain - threshold));
        vec3 night = mix(vec3(0.063, 0.051, 0.094), vec3(0.09, 0.067, 0.125), grain);
        vec3 silver = vec3(0.75, 0.76, 0.81);
        vec3 color = mix(silver, night, band);
        float alpha = clamp(field * uVisibility * (0.92 + uVelocity * 0.08), 0.0, 1.0);
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

export function NightRelicCanvas({
  progressRef,
  reducedMotion,
  onFallback,
}: NightRelicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: window.innerWidth > 680,
        powerPreference: "high-performance",
      });
    } catch {
      onFallback();
      return;
    }

    const isMobile = window.innerWidth <= 680;
    const qualityTier = isMobile ? "mobile" : window.devicePixelRatio > 1.5 ? "high" : "standard";
    canvas.dataset.quality = qualityTier;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F4F3F0");
    scene.fog = new THREE.FogExp2("#100D18", 0.018);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0, 14);

    const ambient = new THREE.AmbientLight("#c8cad3", 1.1);
    const key = new THREE.DirectionalLight("#d9dce7", 3.2);
    key.position.set(-3.5, 5, 7);
    const violetRim = new THREE.PointLight("#6f568c", 16, 24, 2);
    violetRim.position.set(6, -2, 5);
    const redSignalLight = new THREE.PointLight("#A91528", 0, 10, 2);
    redSignalLight.position.set(2.3, 0.6, 2);
    scene.add(ambient, key, violetRim, redSignalLight);

    const erosionMaterial = createErosionMaterial();
    const erosionPlane = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), erosionMaterial);
    erosionPlane.position.z = -4.8;
    scene.add(erosionPlane);

    const relicGroup = new THREE.Group();
    relicGroup.position.set(0.55, -0.05, 0);
    scene.add(relicGroup);

    const fragments: FragmentRuntime[] = RELIC_TOPOLOGY.map((topology) => {
      const { geometry, worldCentroid } = createFragmentGeometry(topology);
      const outer = new THREE.MeshStandardMaterial({
        color: "#7d8390",
        roughness: 0.42,
        metalness: 0.22,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const inner = new THREE.MeshStandardMaterial({
        color: "#171120",
        roughness: 0.26,
        metalness: 0.38,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, [outer, inner]);
      mesh.position.copy(toVector(topology.dormantPosition));
      mesh.rotation.set(...topology.dormantRotation);
      mesh.scale.setScalar(0.72);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      relicGroup.add(mesh);
      return { mesh, outer, inner, assembledPosition: worldCentroid, topology };
    });

    const textureLoader = new THREE.TextureLoader();
    let textureRequested = false;
    let masterTexture: THREE.Texture | null = null;

    const nodePositions: [number, number, number][] = [
      [-4.1, 1.55, 0.8],
      [4.25, 1.45, 0.72],
      [-3.3, -2.35, 0.9],
      [4.05, -1.85, 0.75],
    ];
    const nodes = nodePositions.map(([x, y, z]) => {
      const material = new THREE.MeshBasicMaterial({
        color: "#BFC1CB",
        transparent: true,
        opacity: 0,
      });
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), material);
      node.position.set(x, y, z);
      node.scale.setScalar(0.01);
      relicGroup.add(node);
      return { node, material };
    });

    const trackMaterial = new THREE.LineBasicMaterial({
      color: "#BFC1CB",
      transparent: true,
      opacity: 0,
    });
    const trackCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.1, 1.55, 0.42),
        new THREE.Vector3(-0.8, 2.25, -0.1),
        new THREE.Vector3(4.25, 1.45, 0.38),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.1, 1.55, 0.35),
        new THREE.Vector3(-0.4, -0.2, -0.3),
        new THREE.Vector3(-3.3, -2.35, 0.4),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.3, -2.35, 0.32),
        new THREE.Vector3(0.8, -3.05, -0.25),
        new THREE.Vector3(4.05, -1.85, 0.38),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(4.25, 1.45, 0.34),
        new THREE.Vector3(4.85, -0.15, -0.2),
        new THREE.Vector3(4.05, -1.85, 0.36),
      ]),
    ];
    const tracks = trackCurves.map((curve) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
        trackMaterial,
      );
      relicGroup.add(line);
      return line;
    });

    const particlePositions = new Float32Array((isMobile ? 18 : 42) * 3);
    for (let index = 0; index < particlePositions.length / 3; index += 1) {
      particlePositions[index * 3] = ((index * 47) % 97) / 97 * 26 - 13;
      particlePositions[index * 3 + 1] = ((index * 31) % 89) / 89 * 14 - 7;
      particlePositions[index * 3 + 2] = -4 - ((index * 23) % 71) / 7;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: "#BFC1CB",
      size: isMobile ? 0.025 : 0.035,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let composer: EffectComposer | null = null;
    if (!isMobile) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new BokehPass(scene, camera, {
        focus: 10,
        aperture: 0.000018,
        maxblur: 0.004,
      }));
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.12,
        0.25,
        1.12,
      ));
      composer.addPass(new OutputPass());
    }

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      composer?.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    renderer.compile(scene, camera);

    const dayColor = new THREE.Color("#F4F3F0");
    const nightColor = new THREE.Color("#08080C");
    const tempColor = new THREE.Color();
    const tempPosition = new THREE.Vector3();
    const clock = new THREE.Clock();
    let previousProgress = progressRef.current;
    let scrollVelocity = 0;
    let animationFrame = 0;

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const progress = reducedMotion ? (progressRef.current < 0.2 ? 0 : 0.46) : progressRef.current;
      const rawVelocity = Math.abs(progress - previousProgress) * 48;
      scrollVelocity += (rawVelocity - scrollVelocity) * 0.12;
      previousProgress = progress;

      const erosion = smooth(segment(progress, 0.14, 0.3));
      const descent = smooth(segment(progress, 0.3, 0.4));
      const earth = segment(progress, 0.4, 0.5);
      const collapse = smooth(segment(earth, 0.81, 1));
      const constellation = smooth(segment(earth, 0.48, 0.66)) * (1 - collapse);

      erosionMaterial.uniforms.uProgress.value = erosion;
      erosionMaterial.uniforms.uVisibility.value =
        smooth(segment(progress, 0.12, 0.2)) *
        (1 - smooth(segment(progress, 0.32, 0.39)));
      erosionMaterial.uniforms.uTime.value = elapsed;
      erosionMaterial.uniforms.uVelocity.value = clamp(scrollVelocity, 0, 1);

      tempColor.copy(dayColor).lerp(nightColor, smooth(segment(progress, 0.18, 0.36)));
      scene.background = tempColor;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = mix(0.008, 0.052, descent) + scrollVelocity * 0.003;
      }

      camera.position.z = mix(14, 8.7, descent) - collapse * 0.6;
      camera.position.y = mix(0, -0.24, descent);
      camera.rotation.z = Math.sin(elapsed * 0.18) * 0.002 + scrollVelocity * 0.006;

      particles.material.opacity = smooth(segment(progress, 0.27, 0.4)) * (0.24 + scrollVelocity * 0.12);
      particles.rotation.z = elapsed * 0.006;
      particles.position.z = descent * 1.8;

      if (!textureRequested && progress > 0.31) {
        textureRequested = true;
        textureLoader.load(
          EARTH_PROJECT.masterArtwork,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
            masterTexture = texture;
            fragments.forEach(({ outer }) => {
              outer.map = texture;
              outer.color.set("#aeb2bd");
              outer.needsUpdate = true;
            });
          },
          undefined,
          () => {
            textureRequested = false;
          },
        );
      }

      fragments.forEach((fragment, index) => {
        const delay = fragment.topology.delay;
        const summon = smooth(segment(earth, 0.04 + delay * 0.25, 0.34 + delay * 0.34));
        const assemble = smooth(segment(earth, 0.24 + delay * 0.18, 0.56 + delay * 0.12));
        const fragmentCollapse = smooth(segment(earth, 0.82 + delay * 0.08, 1));
        const arrival = summon * assemble;
        const dormant = toVector(fragment.topology.dormantPosition);
        const collapsed = toVector(fragment.topology.collapsePosition);

        tempPosition.copy(dormant).lerp(fragment.assembledPosition, arrival);
        tempPosition.lerp(collapsed, fragmentCollapse);
        fragment.mesh.position.copy(tempPosition);

        const dormantRotation = fragment.topology.dormantRotation;
        const collapseRotation = fragment.topology.collapseRotation;
        fragment.mesh.rotation.set(
          mix(dormantRotation[0], 0, arrival) + collapseRotation[0] * fragmentCollapse,
          mix(dormantRotation[1], 0, arrival) + collapseRotation[1] * fragmentCollapse,
          mix(dormantRotation[2], 0, arrival) + collapseRotation[2] * fragmentCollapse,
        );

        const visibility = smooth(segment(earth, 0.015 + delay * 0.18, 0.18 + delay * 0.22)) * (1 - fragmentCollapse);
        fragment.outer.opacity = visibility;
        fragment.inner.opacity = visibility * 0.96;
        const depthOffset = fragment.topology.role === "main" ? 0.16 : index % 3 * 0.055;
        fragment.mesh.position.z += depthOffset * assemble;
        fragment.mesh.scale.setScalar(mix(0.7, 1, summon) * mix(1, 0.78, fragmentCollapse));
      });

      trackMaterial.opacity = constellation * 0.32;
      tracks.forEach((track, index) => {
        track.visible = constellation > index * 0.08;
      });
      nodes.forEach(({ node, material }, index) => {
        const activation = smooth(segment(constellation, index * 0.16, 0.44 + index * 0.12));
        material.opacity = activation;
        node.scale.setScalar(0.01 + activation * (1 + Math.sin(elapsed * 2.1 + index) * 0.08));
      });
      redSignalLight.intensity = constellation * 3.4;

      relicGroup.rotation.y = Math.sin(elapsed * 0.16) * 0.012 * (1 - assembleForGroup(earth));
      relicGroup.position.z = mix(-1.8, 0, smooth(segment(earth, 0.05, 0.5)));

      if (composer) composer.render();
      else renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    const assembleForGroup = (earthProgress: number) =>
      smooth(segment(earthProgress, 0.24, 0.58));

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      composer?.dispose();
      fragments.forEach(({ mesh, outer, inner }) => {
        mesh.geometry.dispose();
        outer.dispose();
        inner.dispose();
      });
      nodes.forEach(({ node, material }) => {
        node.geometry.dispose();
        material.dispose();
      });
      tracks.forEach((track) => track.geometry.dispose());
      trackMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      erosionPlane.geometry.dispose();
      erosionMaterial.dispose();
      masterTexture?.dispose();
      renderer.dispose();
    };
  }, [onFallback, progressRef, reducedMotion]);

  return <canvas className="night-relic-canvas" ref={canvasRef} aria-hidden="true" />;
}
