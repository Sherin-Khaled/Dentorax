import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type GalaxyParticleKind = "background" | "core" | "arm" | "cloud" | "lane";

type GalaxyParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  kind: GalaxyParticleKind;
  shimmer: number;
};

export type GalaxyEffectProps = {
  className?: string;
};

const GALAXY_COLORS = {
  core: ["#FFFFFF", "#DDFBFF", "#BDEEFF", "#F5F1FF"],
  arm: ["#DDFBFF", "#7DE8FF", "#68A8FF", "#B698FF"],
  cloud: ["#58D9F5", "#507BFF", "#966CFF", "#72C8FF"],
  lane: ["#071426", "#101738", "#17163D"],
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const first = Math.max(random(), 0.000001);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function spiralPoint(
  random: () => number,
  {
    armCount = 4,
    thickness = 0.1,
    laneOffset = 0,
  }: { armCount?: number; thickness?: number; laneOffset?: number } = {}
) {
  const radius = Math.min(1, Math.pow(random(), 1.38) * 1.02);
  const armIndex = Math.floor(random() * armCount);
  const armGap = (Math.PI * 2) / armCount;
  const organicNoise =
    gaussian(random) * (0.08 + radius * 0.16) +
    (random() < 0.16 ? gaussian(random) * 0.24 : 0);
  const angle =
    armIndex * armGap + radius * 7.35 + organicNoise + laneOffset;
  const perpendicularNoise =
    gaussian(random) * thickness * (0.28 + radius * 0.9);
  const radialNoise = gaussian(random) * 0.012 * (0.4 + radius);

  return {
    radius,
    x:
      Math.cos(angle) * (radius + radialNoise) +
      Math.cos(angle + Math.PI / 2) * perpendicularNoise,
    y:
      Math.sin(angle) * (radius + radialNoise) +
      Math.sin(angle + Math.PI / 2) * perpendicularNoise,
  };
}

function createGalaxyParticles(isMobile: boolean) {
  const random = seededRandom(isMobile ? 0x43a11 : 0x8d3f27);
  const particles: GalaxyParticle[] = [];
  const addParticle = (
    kind: GalaxyParticleKind,
    x: number,
    y: number,
    size: number,
    alpha: number,
    color: string
  ) => {
    particles.push({
      kind,
      x,
      y,
      size,
      alpha,
      color,
      shimmer: random() * Math.PI * 2,
    });
  };

  const backgroundCount = isMobile ? 90 : 150;
  const coreCount = isMobile ? 250 : 430;
  const armCount = isMobile ? 1050 : 1900;
  const cloudCount = isMobile ? 135 : 270;
  const laneCount = isMobile ? 90 : 185;

  for (let index = 0; index < backgroundCount; index += 1) {
    addParticle(
      "background",
      random(),
      random(),
      0.4 + random() * 0.8,
      0.05 + random() * 0.14,
      random() > 0.35 ? "#CDEFFF" : "#B69CFF"
    );
  }

  for (let index = 0; index < coreCount; index += 1) {
    const distance = Math.min(1, Math.pow(random(), 1.8));
    const angle = random() * Math.PI * 2;
    const x = Math.cos(angle) * distance * (0.2 + random() * 0.08);
    const y =
      Math.sin(angle) * distance * (0.3 + random() * 0.12) +
      gaussian(random) * 0.012;
    addParticle(
      "core",
      x,
      y,
      0.7 + random() * 1.75,
      0.48 + (1 - distance) * 0.5,
      GALAXY_COLORS.core[Math.floor(random() * GALAXY_COLORS.core.length)]
    );
  }

  let visibleArmParticles = 0;
  while (visibleArmParticles < armCount) {
    const point = spiralPoint(random, { thickness: 0.105 });
    const edgeFade = Math.pow(Math.max(0, 1 - point.radius), 0.58);
    if (point.radius > 0.76 && random() > edgeFade + 0.2) continue;
    addParticle(
      "arm",
      point.x,
      point.y,
      0.5 + random() * (point.radius < 0.35 ? 1.85 : 1.35),
      (0.2 + random() * 0.62) * (0.4 + edgeFade * 0.72),
      GALAXY_COLORS.arm[Math.floor(random() * GALAXY_COLORS.arm.length)]
    );
    visibleArmParticles += 1;
  }

  for (let index = 0; index < cloudCount; index += 1) {
    const point = spiralPoint(random, { thickness: 0.17 });
    const edgeFade = Math.pow(Math.max(0, 1 - point.radius), 0.72);
    addParticle(
      "cloud",
      point.x,
      point.y,
      4 + random() * 10,
      (0.055 + random() * 0.1) * (0.3 + edgeFade),
      GALAXY_COLORS.cloud[
        Math.floor(random() * GALAXY_COLORS.cloud.length)
      ]
    );
  }

  for (let index = 0; index < laneCount; index += 1) {
    const point = spiralPoint(random, {
      thickness: 0.045,
      laneOffset: -0.14 + gaussian(random) * 0.035,
    });
    addParticle(
      "lane",
      point.x,
      point.y,
      3 + random() * 8,
      (0.055 + random() * 0.085) * Math.max(0.2, 1 - point.radius),
      GALAXY_COLORS.lane[Math.floor(random() * GALAXY_COLORS.lane.length)]
    );
  }

  return particles;
}

function createSoftParticleSprite(color: string, dark = false) {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.25, color);
  gradient.addColorStop(1, dark ? "rgba(4,10,28,0)" : "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return sprite;
}

export function GalaxyEffect({ className = "" }: GalaxyEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let animationFrame = 0;
    let previousTime = 0;
    let rotation = (-20 * Math.PI) / 180;
    let particles: GalaxyParticle[] = [];
    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    const spriteCache = new Map<string, HTMLCanvasElement>();

    const spriteFor = (particle: GalaxyParticle) => {
      const key = `${particle.kind}:${particle.color}`;
      let sprite = spriteCache.get(key);
      if (!sprite) {
        sprite = createSoftParticleSprite(
          particle.color,
          particle.kind === "lane"
        );
        spriteCache.set(key, sprite);
      }
      return sprite;
    };

    const draw = (time = 0) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, cssWidth, cssHeight);

      for (const particle of particles) {
        if (particle.kind !== "background") continue;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(
          particle.x * cssWidth,
          particle.y * cssHeight,
          particle.size,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      const centerX = cssWidth / 2;
      const centerY = cssHeight / 2;
      const radius = Math.min(cssWidth * 0.44, cssHeight * 0.48);
      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);

      const halo = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      halo.addColorStop(0, "rgba(3,8,28,0.88)");
      halo.addColorStop(0.16, "rgba(7,22,61,0.72)");
      halo.addColorStop(0.42, "rgba(12,39,94,0.46)");
      halo.addColorStop(0.7, "rgba(22,35,83,0.2)");
      halo.addColorStop(1, "rgba(8,16,42,0)");
      context.save();
      context.scale(1, 0.44);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.strokeStyle = "rgba(116,204,255,0.04)";
      context.lineWidth = 0.7;
      context.beginPath();
      context.ellipse(0, 0, radius * 0.7, radius * 0.31, 0, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = "rgba(153,125,255,0.03)";
      context.beginPath();
      context.ellipse(0, 0, radius * 0.92, radius * 0.4, 0, 0, Math.PI * 2);
      context.stroke();

      context.scale(radius, radius * 0.44);

      for (const particle of particles) {
        if (particle.kind !== "cloud") continue;
        const size = particle.size / radius;
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = particle.alpha;
        context.drawImage(
          spriteFor(particle),
          particle.x - size,
          particle.y - size,
          size * 2,
          size * 2
        );
      }

      for (const particle of particles) {
        if (particle.kind !== "arm" && particle.kind !== "core") continue;
        const shimmer =
          0.94 +
          Math.sin(time * 0.0012 + particle.shimmer) *
            (particle.kind === "core" ? 0.06 : 0.035);
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = particle.alpha * shimmer;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size / radius,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      for (const particle of particles) {
        if (particle.kind !== "lane") continue;
        const size = particle.size / radius;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = particle.alpha;
        context.drawImage(
          spriteFor(particle),
          particle.x - size,
          particle.y - size,
          size * 2,
          size * 2
        );
      }

      const coreGlow = context.createRadialGradient(0, 0, 0, 0, 0, 0.24);
      coreGlow.addColorStop(0, "rgba(255,255,255,0.78)");
      coreGlow.addColorStop(0.18, "rgba(211,249,255,0.36)");
      coreGlow.addColorStop(0.48, "rgba(101,195,255,0.11)");
      coreGlow.addColorStop(1, "rgba(80,104,255,0)");
      context.globalCompositeOperation = "lighter";
      context.globalAlpha = 1;
      context.fillStyle = coreGlow;
      context.beginPath();
      context.arc(0, 0, 0.24, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(34, time - previousTime) : 16.67;
      previousTime = time;
      rotation += 0.00085 * (elapsed / 16.67);
      draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      cssWidth = Math.max(1, bounds.width);
      cssHeight = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      particles = createGalaxyParticles(cssWidth < 640);
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

export default GalaxyEffect;
