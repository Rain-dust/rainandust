# ADR 0001: Directional paper-ink page transitions

- Status: Accepted
- Date: 2026-08-01

## Context

Rain_dust has four visually distinct main pages. HOME is paper-light, WORKS is architectural-dark, BLOG is editorial-gray, and ME is a pale blue-gray personal archive. Astro's short generic root transition exposes repaint and layout differences between those pages. The existing transition prototype only matches HOME and WORKS and uses one enlarged CSS shape, so later navigations and other route pairs fall back to the visible hard seam.

## Decision

Use one persistent transition controller for every ordered pair among HOME, WORKS, BLOG, and ME. Each pair shares the same paper-ink lifecycle but derives its visible color, entry composition, and reveal direction from both page tones. Reverse navigation is not mirrored playback.

The normal desktop passage lasts 780–900ms and swaps the document during a 60–100ms dense-ink peak. Capable fine-pointer desktops receive a prewarmed WebGL wet-ink layer over a guaranteed multi-sheet ink mask. Mobile, coarse-pointer, and WebGL-unavailable environments use the same directional mask without continuous fluid simulation. Reduced-motion uses a 120–160ms static tonal crossfade with no spatial diffusion. Direct loads receive only a short destination-tone reveal.

Transition ink is exclusive while navigation is active. Page ambience is cleared or paused before covering and resumes only after reveal. HOME does not run persistent ambient ink.

## Consequences

- Every main-route navigation hides the DOM swap without maintaining twelve unrelated animation systems.
- Each ordered route pair remains visibly distinct through page tone and composition.
- WebGL improves wet-edge detail but is not required for continuity.
- The persistent controller must own and clean up one stage, one optional WebGL context, its RAF, timers, animations, and lifecycle listeners.
- Browser verification must include repeated navigation, history traversal, reduced motion, coarse pointer, and WebGL fallback.

