import {
  advectionShader,
  baseVertexShader,
  clearShader,
  curlShader,
  displayShader,
  divergenceShader,
  gradientSubtractShader,
  pressureShader,
  shaderForContext,
  splatShader,
  vorticityShader
} from "./shaders";
import { SHADOW_INK_QUALITY } from "./presets";
import type {
  ShadowInkConfig,
  ShadowInkDiagnostics,
  ShadowInkEngine,
  ShadowInkPauseReason,
  ShadowInkPointerInput,
  ShadowInkPreset
} from "./types";

type GL = WebGLRenderingContext | WebGL2RenderingContext;

interface FluidTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
}

interface DoubleTarget {
  read: FluidTarget;
  write: FluidTarget;
  swap(): void;
}

interface FluidPrograms {
  clear: WebGLProgram;
  splat: WebGLProgram;
  advection: WebGLProgram;
  divergence: WebGLProgram;
  curl: WebGLProgram;
  vorticity: WebGLProgram;
  pressure: WebGLProgram;
  gradientSubtract: WebGLProgram;
  display: WebGLProgram;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class NativeShadowInkEngine implements ShadowInkEngine {
  private readonly canvas: HTMLCanvasElement;
  private gl: GL | null = null;
  private webgl2 = false;
  private halfFloatType = 0;
  private textureInternalFormat = 0;
  private textureFormat = 0;
  private linearFiltering = false;
  private encodedTextures = false;
  private programs: FluidPrograms | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private velocity: DoubleTarget | null = null;
  private dye: DoubleTarget | null = null;
  private pressure: DoubleTarget | null = null;
  private divergence: FluidTarget | null = null;
  private curl: FluidTarget | null = null;
  private raf = 0;
  private running = false;
  private initialized = false;
  private contextFailed = false;
  private lastFrameAt = 0;
  private lastInputAt = performance.now();
  private pendingInputs: ShadowInkPointerInput[] = [];
  private fpsWindowStart = performance.now();
  private fpsFrames = 0;
  private fps = 0;
  private frameTime = 0;
  private pointerInputCount = 0;
  private splatCount = 0;
  private failureReason: string | null = null;
  private pauseReason: ShadowInkPauseReason = null;
  private preset: ShadowInkPreset;
  private config: ShadowInkConfig;
  private contextAbort = new AbortController();

  constructor(canvas: HTMLCanvasElement, preset: ShadowInkPreset) {
    this.canvas = canvas;
    this.preset = { name: preset.name, config: { ...preset.config } };
    this.config = { ...preset.config };
  }

  init(): boolean {
    if (this.initialized) return true;
    this.contextFailed = false;
    this.failureReason = null;

    const options: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    };

    const webgl1 = this.canvas.getContext("webgl", options);
    if (webgl1) {
      this.gl = webgl1;
      const halfFloat = webgl1.getExtension("OES_texture_half_float");
      const halfFloatColor = webgl1.getExtension("EXT_color_buffer_half_float");
      const fullFloat = webgl1.getExtension("OES_texture_float");
      const fullFloatColor = webgl1.getExtension("WEBGL_color_buffer_float");
      if (halfFloat && halfFloatColor) {
        this.halfFloatType = halfFloat.HALF_FLOAT_OES;
        this.linearFiltering = Boolean(webgl1.getExtension("OES_texture_half_float_linear"));
      } else if (fullFloat && fullFloatColor) {
        this.halfFloatType = webgl1.FLOAT;
        this.linearFiltering = Boolean(webgl1.getExtension("OES_texture_float_linear"));
      } else {
        this.halfFloatType = webgl1.UNSIGNED_BYTE;
        this.linearFiltering = true;
        this.encodedTextures = true;
      }
      this.webgl2 = false;
      this.textureInternalFormat = webgl1.RGBA;
      this.textureFormat = webgl1.RGBA;
    } else {
      const webgl2 = this.canvas.getContext("webgl2", options);
      if (!webgl2) return this.failInitialization("context unavailable: WebGL2");
      this.gl = webgl2;
      this.webgl2 = true;
      const colorBuffer = webgl2.getExtension("EXT_color_buffer_float");
      if (colorBuffer) {
        this.halfFloatType = webgl2.HALF_FLOAT;
        this.textureInternalFormat = webgl2.RGBA16F;
        this.linearFiltering = Boolean(webgl2.getExtension("OES_texture_float_linear"));
      } else {
        this.halfFloatType = webgl2.UNSIGNED_BYTE;
        this.textureInternalFormat = webgl2.RGBA8;
        this.linearFiltering = true;
        this.encodedTextures = true;
      }
      this.textureFormat = webgl2.RGBA;
    }

    try {
      this.createPrograms();
      this.createQuad();
      this.resize();
      this.bindContextLifecycle();
      this.initialized = true;
      this.clear();
      return true;
    } catch (error) {
      console.warn("[shadow-ink] WebGL initialization failed; using static fallback.", error);
      const message = error instanceof Error ? error.message : String(error);
      if (/framebuffer/i.test(message)) {
        return this.failInitialization(`framebuffer incomplete: ${message}`);
      }
      if (/shader|program|link/i.test(message)) {
        return this.failInitialization(`shader compile failure: ${message}`);
      }
      return this.failInitialization(`initialization failure: ${message}`);
    }
  }

  start(): void {
    if (!this.initialized || this.contextFailed || this.config.quality === "STATIC") return;
    if (this.running) return;
    this.running = true;
    this.pauseReason = null;
    this.lastFrameAt = performance.now();
    this.raf = requestAnimationFrame(this.renderFrame);
  }

  pause(reason: ShadowInkPauseReason = "manual"): void {
    this.running = false;
    this.pauseReason = reason;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  resume(): void {
    if (!this.initialized || this.contextFailed || this.config.quality === "STATIC") return;
    this.lastFrameAt = performance.now();
    this.start();
  }

  clear(): void {
    const gl = this.gl;
    if (!gl) return;
    for (const target of this.allTargets()) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
      const isSignedTarget =
        this.encodedTextures &&
        (target === this.velocity?.read ||
          target === this.velocity?.write ||
          target === this.pressure?.read ||
          target === this.pressure?.write ||
          target === this.divergence ||
          target === this.curl);
      gl.clearColor(isSignedTarget ? 0.5 : 0, isSignedTarget ? 0.5 : 0, isSignedTarget ? 0.5 : 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  resize(): void {
    const gl = this.gl;
    if (!gl) return;
    const quality = SHADOW_INK_QUALITY[this.config.quality];
    if (this.config.quality === "STATIC") return;

    const dpr = Math.min(window.devicePixelRatio || 1, quality.dprCap);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));
    const canvasChanged = this.canvas.width !== width || this.canvas.height !== height;
    if (canvasChanged) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
    }

    const simulationSize = this.resolutionFor(quality.simulationResolution);
    const dyeSize = this.resolutionFor(quality.dyeResolution);
    const targetsChanged =
      !this.velocity ||
      this.velocity.read.width !== simulationSize.width ||
      this.velocity.read.height !== simulationSize.height ||
      !this.dye ||
      this.dye.read.width !== dyeSize.width ||
      this.dye.read.height !== dyeSize.height;

    if (!targetsChanged) return;
    this.disposeTargets();
    this.velocity = this.createDoubleTarget(simulationSize.width, simulationSize.height);
    this.pressure = this.createDoubleTarget(simulationSize.width, simulationSize.height);
    this.divergence = this.createTarget(simulationSize.width, simulationSize.height);
    this.curl = this.createTarget(simulationSize.width, simulationSize.height);
    this.dye = this.createDoubleTarget(dyeSize.width, dyeSize.height);
    this.clear();
  }

  setPreset(preset: ShadowInkPreset): void {
    this.preset = { name: preset.name, config: { ...preset.config } };
    this.setConfig(preset.config);
  }

  setConfig(config: Partial<ShadowInkConfig>): void {
    const previousQuality = this.config.quality;
    this.config = { ...this.config, ...config };
    if (previousQuality !== this.config.quality && this.initialized) {
      if (this.config.quality === "STATIC") {
        this.pause("unsupported");
        this.disposeTargets();
      } else {
        this.resize();
        this.resume();
      }
    }
  }

  inject(input: ShadowInkPointerInput): void {
    if (!this.initialized || this.contextFailed || !this.config.enabled) return;
    this.pointerInputCount += 1;
    this.pendingInputs.push(input);
    if (this.pendingInputs.length > 24) {
      this.pendingInputs.splice(0, this.pendingInputs.length - 24);
    }
    this.lastInputAt = performance.now();
    if (!this.running) this.resume();
  }

  getDiagnostics(): ShadowInkDiagnostics {
    const quality = SHADOW_INK_QUALITY[this.config.quality];
    return {
      fps: Math.round(this.fps),
      frameTime: Number(this.frameTime.toFixed(2)),
      simulationResolution: this.velocity
        ? `${this.velocity.read.width}×${this.velocity.read.height}`
        : quality.simulationResolution
          ? "not initialized"
          : "static",
      dyeResolution: this.dye
        ? `${this.dye.read.width}×${this.dye.read.height}`
        : quality.dyeResolution
          ? "not initialized"
          : "static",
      webglVersion: this.gl ? (this.webgl2 ? "WebGL2" : "WebGL1") : "none",
      pointerInputCount: this.pointerInputCount,
      splatCount: this.splatCount,
      failureReason: this.failureReason,
      preset: this.preset.name,
      quality: this.config.quality,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: matchMedia("(pointer: coarse)").matches,
      status: this.contextFailed
        ? "failed"
        : this.config.quality === "STATIC"
          ? "static"
          : this.running
            ? "active"
            : "paused",
      pauseReason: this.pauseReason
    };
  }

  destroy(): void {
    this.pause("manual");
    this.contextAbort.abort();
    this.disposeTargets();
    const gl = this.gl;
    if (gl) {
      if (this.programs) {
        Object.values(this.programs).forEach((program) => gl.deleteProgram(program));
      }
      if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.useProgram(null);
    }
    this.programs = null;
    this.quadBuffer = null;
    this.gl = null;
    this.velocity = null;
    this.dye = null;
    this.pressure = null;
    this.divergence = null;
    this.curl = null;
    this.pendingInputs = [];
    this.initialized = false;
    this.contextFailed = false;
    this.failureReason = null;
    this.encodedTextures = false;
  }

  private readonly renderFrame = (timestamp: number): void => {
    if (!this.running || !this.gl || !this.programs) return;
    const quality = SHADOW_INK_QUALITY[this.config.quality];
    const minimumFrameDuration = 1000 / Math.max(1, quality.frameRateCap);
    const elapsed = timestamp - this.lastFrameAt;
    if (elapsed < minimumFrameDuration - 1) {
      this.raf = requestAnimationFrame(this.renderFrame);
      return;
    }

    const frameStartedAt = performance.now();
    const dt = clamp(elapsed / 1000, 0.001, 0.025);
    this.lastFrameAt = timestamp;
    this.step(dt);
    this.frameTime = performance.now() - frameStartedAt;
    this.updateFps(timestamp);

    if (timestamp - this.lastInputAt > 12000) {
      this.pause("idle");
      return;
    }
    this.raf = requestAnimationFrame(this.renderFrame);
  };

  private step(dt: number): void {
    const gl = this.gl;
    const programs = this.programs;
    const velocity = this.velocity;
    const dye = this.dye;
    const pressure = this.pressure;
    const divergence = this.divergence;
    const curl = this.curl;
    if (!gl || !programs || !velocity || !dye || !pressure || !divergence || !curl) return;

    gl.disable(gl.BLEND);

    const inputs = this.pendingInputs.splice(0);
    for (const input of inputs) {
      const speedGain = clamp(input.speed, 0.35, 2.6);
      const velocityColor: [number, number, number] = [
        input.dx * this.config.force * 860 * speedGain,
        -input.dy * this.config.force * 860 * speedGain,
        0
      ];
      this.splat(velocity, input.x, 1 - input.y, velocityColor, this.config.radius, true);

      const signalAmount = input.signal ? this.config.signalRed : 0;
      const dyeColor: [number, number, number] = input.signal
        ? [0.34 + signalAmount, 0.055, 0.045]
        : [0.12, 0.17, 0.18];
      this.splat(dye, input.x, 1 - input.y, dyeColor, this.config.radius * 1.18, false);
    }

    this.draw(programs.curl, curl, {
      uVelocity: velocity.read,
      uTexel: [velocity.read.texelX, velocity.read.texelY],
      uSigned: this.encodedTextures ? 1 : 0
    });

    this.draw(programs.vorticity, velocity.write, {
      uVelocity: velocity.read,
      uCurl: curl,
      uTexel: [velocity.read.texelX, velocity.read.texelY],
      uCurlStrength: this.config.curl,
      uDt: dt,
      uSigned: this.encodedTextures ? 1 : 0
    });
    velocity.swap();

    this.draw(programs.divergence, divergence, {
      uVelocity: velocity.read,
      uTexel: [velocity.read.texelX, velocity.read.texelY],
      uSigned: this.encodedTextures ? 1 : 0
    });

    this.draw(programs.clear, pressure.write, {
      uTexture: pressure.read,
      uValue: 0.8,
      uSigned: this.encodedTextures ? 1 : 0
    });
    pressure.swap();

    const iterations = SHADOW_INK_QUALITY[this.config.quality].pressureIterations;
    for (let index = 0; index < iterations; index += 1) {
      this.draw(programs.pressure, pressure.write, {
        uPressure: pressure.read,
        uDivergence: divergence,
        uTexel: [pressure.read.texelX, pressure.read.texelY],
        uSigned: this.encodedTextures ? 1 : 0
      });
      pressure.swap();
    }

    this.draw(programs.gradientSubtract, velocity.write, {
      uPressure: pressure.read,
      uVelocity: velocity.read,
      uTexel: [velocity.read.texelX, velocity.read.texelY],
      uSigned: this.encodedTextures ? 1 : 0
    });
    velocity.swap();

    this.draw(programs.advection, velocity.write, {
      uVelocity: velocity.read,
      uSource: velocity.read,
      uVelocityTexel: [velocity.read.texelX, velocity.read.texelY],
      uSourceTexel: [velocity.read.texelX, velocity.read.texelY],
      uDt: dt,
      uDissipation: Math.pow(this.config.velocityDissipation, dt * 60),
      uVelocitySigned: this.encodedTextures ? 1 : 0,
      uSourceSigned: this.encodedTextures ? 1 : 0
    });
    velocity.swap();

    this.draw(programs.advection, dye.write, {
      uVelocity: velocity.read,
      uSource: dye.read,
      uVelocityTexel: [velocity.read.texelX, velocity.read.texelY],
      uSourceTexel: [dye.read.texelX, dye.read.texelY],
      uDt: dt,
      uDissipation: Math.pow(this.config.densityDissipation, dt * 60),
      uVelocitySigned: this.encodedTextures ? 1 : 0,
      uSourceSigned: 0
    });
    dye.swap();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.draw(programs.display, null, {
      uDye: dye.read,
      uOpacity: this.config.opacity,
      uInkColor: this.config.inkColor,
      uHighlightColor: this.config.highlightColor,
      uSignalColor: this.config.signalColor
    });
    gl.disable(gl.BLEND);
  }

  private splat(
    target: DoubleTarget,
    x: number,
    y: number,
    color: [number, number, number],
    radius: number,
    signed: boolean
  ): void {
    if (!this.programs) return;
    this.splatCount += 1;
    this.draw(this.programs.splat, target.write, {
      uTarget: target.read,
      uAspect: this.canvas.width / Math.max(1, this.canvas.height),
      uColor: color,
      uPoint: [x, y],
      uRadius: radius * radius,
      uSigned: signed && this.encodedTextures ? 1 : 0
    });
    target.swap();
  }

  private draw(
    program: WebGLProgram,
    target: FluidTarget | null,
    uniforms: Record<string, FluidTarget | number | [number, number] | [number, number, number]>
  ): void {
    const gl = this.gl;
    if (!gl || !this.quadBuffer) return;
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.viewport(0, 0, target?.width ?? this.canvas.width, target?.height ?? this.canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let textureUnit = 0;
    for (const [name, value] of Object.entries(uniforms)) {
      const location = gl.getUniformLocation(program, name);
      if (!location) continue;
      if (typeof value === "number") {
        gl.uniform1f(location, value);
      } else if (Array.isArray(value)) {
        if (value.length === 2) gl.uniform2f(location, value[0], value[1]);
        if (value.length === 3) gl.uniform3f(location, value[0], value[1], value[2]);
      } else {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, value.texture);
        gl.uniform1i(location, textureUnit);
        textureUnit += 1;
      }
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private createPrograms(): void {
    this.programs = {
      clear: this.createProgram(clearShader, "clear"),
      splat: this.createProgram(splatShader, "splat"),
      advection: this.createProgram(advectionShader, "advection"),
      divergence: this.createProgram(divergenceShader, "divergence"),
      curl: this.createProgram(curlShader, "curl"),
      vorticity: this.createProgram(vorticityShader, "vorticity"),
      pressure: this.createProgram(pressureShader, "pressure"),
      gradientSubtract: this.createProgram(gradientSubtractShader, "gradient subtract"),
      display: this.createProgram(displayShader, "display")
    };
  }

  private createProgram(fragmentSource: string, label: string): WebGLProgram {
    const gl = this.gl;
    if (!gl) throw new Error("WebGL context unavailable");
    const vertex = this.compileShader(
      gl.VERTEX_SHADER,
      shaderForContext(baseVertexShader, this.webgl2, false),
      `${label} vertex`
    );
    const fragment = this.compileShader(
      gl.FRAGMENT_SHADER,
      shaderForContext(fragmentSource, this.webgl2, true),
      `${label} fragment`
    );
    const program = gl.createProgram();
    if (!program) throw new Error("Unable to create WebGL program");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? "Unknown WebGL link error";
      gl.deleteProgram(program);
      throw new Error(`Shader link failure: ${message}`);
    }
    return program;
  }

  private compileShader(type: number, source: string, label: string): WebGLShader {
    const gl = this.gl;
    if (!gl) throw new Error("WebGL context unavailable");
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Unable to create WebGL shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) ?? "Unknown WebGL shader error";
      gl.deleteShader(shader);
      throw new Error(`Shader compile failure (${label}): ${message}`);
    }
    return shader;
  }

  private createQuad(): void {
    const gl = this.gl;
    if (!gl) return;
    this.quadBuffer = gl.createBuffer();
    if (!this.quadBuffer) throw new Error("Unable to create fullscreen quad");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
  }

  private createTarget(width: number, height: number): FluidTarget {
    const gl = this.gl;
    if (!gl) throw new Error("WebGL context unavailable");
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) throw new Error("Unable to create fluid framebuffer");

    gl.bindTexture(gl.TEXTURE_2D, texture);
    const filter = this.linearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.textureInternalFormat,
      width,
      height,
      0,
      this.textureFormat,
      this.halfFloatType,
      null
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      throw new Error("Half-float framebuffer is incomplete");
    }

    return {
      texture,
      framebuffer,
      width,
      height,
      texelX: 1 / width,
      texelY: 1 / height
    };
  }

  private createDoubleTarget(width: number, height: number): DoubleTarget {
    const pair: DoubleTarget = {
      read: this.createTarget(width, height),
      write: this.createTarget(width, height),
      swap() {
        const current = pair.read;
        pair.read = pair.write;
        pair.write = current;
      }
    };
    return pair;
  }

  private resolutionFor(base: number): { width: number; height: number } {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    if (aspect >= 1) return { width: Math.round(base * aspect), height: base };
    return { width: base, height: Math.round(base / aspect) };
  }

  private bindContextLifecycle(): void {
    this.contextAbort.abort();
    this.contextAbort = new AbortController();
    const { signal } = this.contextAbort;
    this.canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        this.contextFailed = true;
        this.pause("unsupported");
      },
      { signal }
    );
    this.canvas.addEventListener(
      "webglcontextrestored",
      () => {
        this.contextFailed = false;
        this.programs = null;
        this.quadBuffer = null;
        this.velocity = null;
        this.dye = null;
        this.pressure = null;
        this.divergence = null;
        this.curl = null;
        this.initialized = false;
        if (this.init()) this.start();
      },
      { signal }
    );
  }

  private updateFps(timestamp: number): void {
    this.fpsFrames += 1;
    const elapsed = timestamp - this.fpsWindowStart;
    if (elapsed < 500) return;
    this.fps = (this.fpsFrames * 1000) / elapsed;
    this.fpsFrames = 0;
    this.fpsWindowStart = timestamp;
  }

  private allTargets(): FluidTarget[] {
    const targets: FluidTarget[] = [];
    for (const pair of [this.velocity, this.dye, this.pressure]) {
      if (pair) targets.push(pair.read, pair.write);
    }
    if (this.divergence) targets.push(this.divergence);
    if (this.curl) targets.push(this.curl);
    return targets;
  }

  private disposeTargets(): void {
    const gl = this.gl;
    if (gl) {
      for (const target of this.allTargets()) {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      }
    }
    this.velocity = null;
    this.dye = null;
    this.pressure = null;
    this.divergence = null;
    this.curl = null;
  }

  private failInitialization(reason: string): false {
    this.contextFailed = true;
    this.failureReason = reason;
    this.initialized = false;
    this.pauseReason = "unsupported";
    this.disposeTargets();
    const gl = this.gl;
    if (gl) {
      if (this.programs) {
        Object.values(this.programs).forEach((program) => gl.deleteProgram(program));
      }
      if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.programs = null;
    this.quadBuffer = null;
    this.gl = null;
    return false;
  }
}
