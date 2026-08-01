# Rain_dust Experience

This context defines the experiential language shared across the Rain_dust personal site so that page-specific visual identities remain coherent.

## Page Transitions

**Transition Grammar**:
The shared sequence that makes navigation feel continuous across the site while allowing each route direction to have its own visible character.
_Avoid_: One universal transition effect, unrelated per-page animations

**Directional Transition**:
The distinct visual expression assigned to an ordered source-to-destination page pair; reversing the route may produce a different expression.
_Avoid_: Destination-only transition, symmetric transition

**Route-Composed Ink Origin**:
The composition rule that determines where ink enters or clears according to the ordered route pair. It uses stable directional intent with slight texture variation and never originates from the pointer or click position.
_Avoid_: Pointer-centered bloom, cursor halo, fully random direction

**Page Tone**:
The visual atmosphere associated with a page: HOME is paper-light, WORKS is architectural-dark, BLOG is editorial-gray, and ME is a pale blue-gray personal archive. ME remains cooler and more restrained than HOME without becoming as dark as WORKS or as neutral as BLOG.
_Avoid_: Theme, color preset

**Profile Wash**:
The pale blue-gray ink atmosphere unique to ME, expressing a quiet personal archive through cool, low-saturation washes.
_Avoid_: Pastel pink, glass panel, BLOG gray, WORKS black

**Main Route Transition Matrix**:
The complete set of direct transitions among HOME, WORKS, BLOG, and ME. Every ordered route pair uses the shared Transition Grammar, while its visible ink density, color, and reveal behavior are derived from both the source and destination Page Tones. Reverse directions are distinct transitions rather than mirrored playback.
_Avoid_: HOME-only transition, twelve unrelated animations, symmetric reverse

**Dense Ink Peak**:
The brief, fully obscuring midpoint of an ink-style transition where varied ink texture remains visible and the navigation seam disappears.
_Avoid_: Black screen, flat curtain, paused blackout

**Standard Passage Rhythm**:
The normal desktop timing of a transition: 780–900ms total, with a 60–100ms Dense Ink Peak containing the DOM swap. Repeated navigation is locked only for the active passage and restored immediately afterward.
_Avoid_: PPT fade, prolonged blackout, unlocked overlapping navigation

**Transition Exclusivity**:
During a page transition, the passage ink is the only active ink or ambient visual system. Source-page ambience is stopped and cleared before passage ink begins; destination ambience starts only after reveal completes. HOME has no persistent ambient ink, while WORKS may resume its architectural shadow afterward.
_Avoid_: Stacked ink layers, simultaneous RAF systems, HOME ambient ink

**Paper Ink Bleed**:
The site's abstract ink-wash motion language, characterized by irregular feathered edges, tonal variation, and wet diffusion without literal brush or calligraphy imagery.
_Avoid_: Brush stroke, calligraphy wipe, circular blob

**Mobile Ink Passage**:
The mobile expression of the Transition Grammar. It preserves each Directional Transition's tone and ink-in/ink-out meaning through precomposed ink-texture masks rather than continuous fluid simulation.
_Avoid_: Continuous mobile WebGL fluid, generic fade, desktop effect scaled down unchanged

**Guaranteed Ink Passage**:
The progressive-delivery rule for normal motion: capable desktop browsers receive WebGL wet-ink diffusion, while unsupported desktop browsers and mobile devices receive precomposed ink-texture masks. Both preserve the same direction, Page Tones, rhythm, and Dense Ink Peak, so navigation never falls back to a visible hard swap.
_Avoid_: WebGL-or-nothing transition, user configuration requirement, debug UI in production

**Reduced Ink Passage**:
The reduced-motion expression of the Transition Grammar: a 120–160ms static tonal ink crossfade with no diffusion, displacement, or pointer response. It preserves the ordered Page Tone relationship and places the DOM swap at the most obscured midpoint.
_Avoid_: Full fluid motion, spatial wipe, no transition seam protection

**Initial Tone Reveal**:
The 300–420ms page-specific ink reveal used only for a direct URL visit, refresh, or first load where no real source page exists. Full Directional Transitions are reserved for in-site navigation and browser history traversal.
_Avoid_: Invented source page, full transition on refresh, unanimated hard load
