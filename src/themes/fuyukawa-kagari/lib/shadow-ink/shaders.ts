export const baseVertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const clearShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uValue;
uniform float uSigned;

float decodeSigned(float value) {
  return (value * 2.0 - 1.0) * 128.0;
}

float encodeSigned(float value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  vec4 sampleValue = texture2D(uTexture, vUv);
  float value = uSigned > 0.5 ? decodeSigned(sampleValue.x) : sampleValue.x;
  value *= uValue;
  gl_FragColor = vec4(uSigned > 0.5 ? encodeSigned(value) : value, 0.0, 0.0, 1.0);
}
`;

export const splatShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
uniform float uSigned;

vec3 decodeSigned(vec3 value) {
  return (value * 2.0 - 1.0) * 128.0;
}

vec3 encodeSigned(vec3 value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float falloff = exp(-dot(p, p) / max(uRadius, 0.00001));
  vec3 base = texture2D(uTarget, vUv).xyz;
  if (uSigned > 0.5) base = decodeSigned(base);
  vec3 result = base + uColor * falloff;
  if (uSigned > 0.5) result = encodeSigned(result);
  gl_FragColor = vec4(result, 1.0);
}
`;

export const advectionShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uVelocityTexel;
uniform vec2 uSourceTexel;
uniform float uDt;
uniform float uDissipation;
uniform float uVelocitySigned;
uniform float uSourceSigned;

vec4 decodeSigned(vec4 value) {
  return vec4((value.xyz * 2.0 - 1.0) * 128.0, value.a);
}

vec4 encodeSigned(vec4 value) {
  return vec4(clamp(value.xyz / 128.0 * 0.5 + 0.5, 0.0, 1.0), value.a);
}

vec4 sampleBilerp(sampler2D textureSampler, vec2 uv, vec2 texel) {
  vec2 st = uv / texel - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(textureSampler, (iuv + vec2(0.5, 0.5)) * texel);
  vec4 b = texture2D(textureSampler, (iuv + vec2(1.5, 0.5)) * texel);
  vec4 c = texture2D(textureSampler, (iuv + vec2(0.5, 1.5)) * texel);
  vec4 d = texture2D(textureSampler, (iuv + vec2(1.5, 1.5)) * texel);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main() {
  vec4 velocitySample = texture2D(uVelocity, vUv);
  vec2 velocity = uVelocitySigned > 0.5 ? decodeSigned(velocitySample).xy : velocitySample.xy;
  vec2 coord = vUv - uDt * velocity * uVelocityTexel;
  vec4 source = sampleBilerp(uSource, coord, uSourceTexel);
  if (uSourceSigned > 0.5) source = decodeSigned(source);
  source *= uDissipation;
  if (uSourceSigned > 0.5) source = encodeSigned(source);
  gl_FragColor = source;
  gl_FragColor.a = 1.0;
}
`;

export const divergenceShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uSigned;

vec2 velocityAt(vec2 uv) {
  vec2 value = texture2D(uVelocity, uv).xy;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

float encodeSigned(float value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  float left = velocityAt(vUv - vec2(uTexel.x, 0.0)).x;
  float right = velocityAt(vUv + vec2(uTexel.x, 0.0)).x;
  float bottom = velocityAt(vUv - vec2(0.0, uTexel.y)).y;
  float top = velocityAt(vUv + vec2(0.0, uTexel.y)).y;
  float divergence = 0.5 * (right - left + top - bottom);
  gl_FragColor = vec4(uSigned > 0.5 ? encodeSigned(divergence) : divergence, 0.0, 0.0, 1.0);
}
`;

export const curlShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uSigned;

vec2 velocityAt(vec2 uv) {
  vec2 value = texture2D(uVelocity, uv).xy;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

float encodeSigned(float value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  float left = velocityAt(vUv - vec2(uTexel.x, 0.0)).y;
  float right = velocityAt(vUv + vec2(uTexel.x, 0.0)).y;
  float bottom = velocityAt(vUv - vec2(0.0, uTexel.y)).x;
  float top = velocityAt(vUv + vec2(0.0, uTexel.y)).x;
  float curlValue = 0.5 * (right - left - top + bottom);
  gl_FragColor = vec4(uSigned > 0.5 ? encodeSigned(curlValue) : curlValue, 0.0, 0.0, 1.0);
}
`;

export const vorticityShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uCurlStrength;
uniform float uDt;
uniform float uSigned;

float scalarAt(sampler2D source, vec2 uv) {
  float value = texture2D(source, uv).x;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

vec2 velocityAt(vec2 uv) {
  vec2 value = texture2D(uVelocity, uv).xy;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

vec2 encodeVelocity(vec2 value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  float left = scalarAt(uCurl, vUv - vec2(uTexel.x, 0.0));
  float right = scalarAt(uCurl, vUv + vec2(uTexel.x, 0.0));
  float bottom = scalarAt(uCurl, vUv - vec2(0.0, uTexel.y));
  float top = scalarAt(uCurl, vUv + vec2(0.0, uTexel.y));
  float center = scalarAt(uCurl, vUv);
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(left) - abs(right));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * center;
  force.y *= -1.0;
  vec2 velocity = velocityAt(vUv) + force * uDt;
  if (uSigned > 0.5) velocity = encodeVelocity(velocity);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const pressureShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
uniform float uSigned;

float scalarAt(sampler2D source, vec2 uv) {
  float value = texture2D(source, uv).x;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

float encodeSigned(float value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  float left = scalarAt(uPressure, vUv - vec2(uTexel.x, 0.0));
  float right = scalarAt(uPressure, vUv + vec2(uTexel.x, 0.0));
  float bottom = scalarAt(uPressure, vUv - vec2(0.0, uTexel.y));
  float top = scalarAt(uPressure, vUv + vec2(0.0, uTexel.y));
  float divergence = scalarAt(uDivergence, vUv);
  float pressure = (left + right + bottom + top - divergence) * 0.25;
  gl_FragColor = vec4(uSigned > 0.5 ? encodeSigned(pressure) : pressure, 0.0, 0.0, 1.0);
}
`;

export const gradientSubtractShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uSigned;

float pressureAt(vec2 uv) {
  float value = texture2D(uPressure, uv).x;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

vec2 velocityAt(vec2 uv) {
  vec2 value = texture2D(uVelocity, uv).xy;
  return uSigned > 0.5 ? (value * 2.0 - 1.0) * 128.0 : value;
}

vec2 encodeVelocity(vec2 value) {
  return clamp(value / 128.0 * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  float left = pressureAt(vUv - vec2(uTexel.x, 0.0));
  float right = pressureAt(vUv + vec2(uTexel.x, 0.0));
  float bottom = pressureAt(vUv - vec2(0.0, uTexel.y));
  float top = pressureAt(vUv + vec2(0.0, uTexel.y));
  vec2 velocity = velocityAt(vUv);
  velocity -= vec2(right - left, top - bottom);
  if (uSigned > 0.5) velocity = encodeVelocity(velocity);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const displayShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uDye;
uniform float uOpacity;
uniform vec3 uInkColor;
uniform vec3 uHighlightColor;
uniform vec3 uSignalColor;

void main() {
  vec3 dye = max(texture2D(uDye, vUv).rgb, 0.0);
  float density = max(max(dye.r, dye.g), dye.b);
  float redBias = smoothstep(0.05, 0.38, dye.r - max(dye.g, dye.b));
  float edge = smoothstep(0.02, 0.62, density);
  vec3 neutralInk = mix(uInkColor, uHighlightColor, smoothstep(0.06, 0.7, dye.g));
  vec3 color = mix(neutralInk, uSignalColor, redBias * 0.68);
  gl_FragColor = vec4(color, clamp(edge * uOpacity, 0.0, 0.82));
}
`;

export function shaderForContext(source: string, webgl2: boolean, fragment = true): string {
  if (!webgl2) return source;
  let output = source
    .replace(/\battribute\b/g, "in")
    .replace(/\bvarying\b/g, fragment ? "in" : "out")
    .replace(/\btexture2D\b/g, "texture");
  if (fragment) {
    output = output.replace(/\bgl_FragColor\b/g, "outColor");
    output = `#version 300 es\nout vec4 outColor;\n${output}`;
  } else {
    output = `#version 300 es\n${output}`;
  }
  return output;
}
