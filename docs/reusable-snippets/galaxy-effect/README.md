# GalaxyEffect

`GalaxyEffect` is the reusable form of the accidental galaxy visual previously embedded in the X Dental Store About page. It is programmatically generated with a React-managed HTML Canvas 2D context. It does not use Three.js, WebGL, shaders, images, video, GIFs, or external visual assets.

## Requirements

- React
- Framer Motion, used only for `useReducedMotion`
- A browser with Canvas 2D, `ResizeObserver`, and `requestAnimationFrame`

Install the required packages:

```bash
npm install react framer-motion
```

## Import and usage

```tsx
import { GalaxyEffect } from "./GalaxyEffect";

export function Example() {
  return (
    <div style={{ width: 680, height: 600 }}>
      <GalaxyEffect className="galaxy" />
    </div>
  );
}
```

The component sizes its canvas from its rendered element, so its parent must provide a width and height. The original utility classes `h-full w-full` remain on the canvas. If Tailwind is unavailable, provide equivalent CSS:

```css
.galaxy {
  width: 100%;
  height: 100%;
  display: block;
}
```

## Props

- `className?: string` — adds classes to the canvas element.

The particle counts, seeded layouts, colors, rotation speed, glow, spiral geometry, and device-pixel-ratio cap intentionally match the preserved implementation. They are not exposed as props so the saved visual remains exact.

## Rendering and behavior

- Client-only: the animation and resizing code runs inside `useEffect`; server rendering can emit the empty canvas, but drawing requires browser APIs.
- Reduced motion: when the user requests reduced motion, one static frame is drawn and the animation loop is not started.
- Responsive behavior: canvases narrower than 640px use the original reduced mobile particle counts and a separate deterministic seed.
- Performance: desktop draws roughly 2,935 particles; mobile draws roughly 1,615. Device pixel ratio is capped at 2. The effect creates cached 64px sprites for cloud and dust particles.
- Interaction: there is no mouse, pointer, keyboard, or scroll interaction.
- Assets: none.

## Origin and license

The exact source was `src/pages/about.tsx`, where the implementation consisted of `GalaxyParticle`, `GALAXY_COLORS`, the seeded particle helpers, `createSoftParticleSprite`, and `GalaxyCanvas`. No source attribution, external URL, license notice, or copied-library marker was present in the project. This preservation therefore records only the repository implementation and does not assert a third-party license.
