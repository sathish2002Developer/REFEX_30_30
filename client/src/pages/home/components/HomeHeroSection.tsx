import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import img from "../../../mocks/Home.jpg";
import type { HomeHeroConfig, HomeHeroCta } from "../../../types/homeHeroCms";

function ParticleField({
  opacity,
  enabled,
}: {
  opacity: number;
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      op: number;
    }[] = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        op: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.op})`;
        ctx.fill();
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: opacity / 100 }}
    />
  );
}

function CtaButton({ cta }: { cta: HomeHeroCta }) {
  const base =
    "group inline-flex items-center gap-2 px-6 py-3 font-sans font-semibold text-sm tracking-wide rounded-full transition-all duration-300 hover:gap-4 hover:scale-105";
  const primary =
    "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]";
  const outline =
    "border-2 border-amber-400/70 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)]";
  const cls = `${base} ${cta.variant === "outline" ? outline : primary}`;

  const inner = (
    <>
      <span>{cta.label}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
    </>
  );

  if (cta.href.startsWith("/")) {
    return (
      <Link to={cta.href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={cta.href} className={cls} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

interface Props {
  config: HomeHeroConfig;
  heroLoaded: boolean;
}

export default function HomeHeroSection({ config, heroLoaded }: Props) {
  const overlayAlpha = Math.min(100, Math.max(0, config.overlay_opacity)) / 100;
  const radialStrength =
    Math.min(100, Math.max(0, config.radial_glow_strength_percent)) / 100;
  const anim = (classes: string) => {
    if (!heroLoaded) return "opacity-0";
    if (!config.stagger_animations_enabled) return "";
    return `${classes} opacity-0`;
  };

  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-16 md:pt-20 min-h-[100svh] md:min-h-[min(700px,85svh)] bg-neutral-950">
      <div
        className="absolute inset-0 md:hidden pointer-events-none bg-gradient-to-b from-neutral-950 via-[#14100a] to-neutral-950"
        aria-hidden
      />
      <div
        className="absolute inset-0 md:hidden pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,_rgba(212,175,55,0.16)_0%,_transparent_62%)]"
        aria-hidden
      />
      <img
        src={img}
        alt=""
        className="hidden md:block absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
        loading="eager"
        decoding="async"
      />

      <div
        className="absolute inset-0 bg-black pointer-events-none hidden md:block"
        style={{ opacity: overlayAlpha }}
      />

      {config.radial_glow_enabled && (
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background: `radial-gradient(ellipse at center, rgba(212,175,55,${
              0.12 * radialStrength
            }) 0%, transparent 70%)`,
          }}
        />
      )}

      {config.particles_enabled && (
        <div className="absolute inset-0 z-[1] hidden md:block">
          <ParticleField
            enabled={config.particles_enabled}
            opacity={config.particle_canvas_opacity_percent}
          />
        </div>
      )}

      {config.floating_orbs_enabled && (
        <div className="absolute inset-0 pointer-events-none z-[2] hidden md:block">
          <div className="absolute top-[15%] right-[10%] w-[250px] h-[250px] bg-amber-100/20 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[20%] left-[8%] w-[200px] h-[200px] bg-amber-50/30 rounded-full blur-[80px] animate-float-medium" />
          <div className="absolute top-[45%] left-[55%] w-[120px] h-[120px] bg-amber-100/15 rounded-full blur-[60px] animate-pulse-glow" />
        </div>
      )}

      {config.rings_enabled && (
        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden hidden md:flex items-center justify-center">
          <div
            className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] border border-amber-300/20 rounded-full animate-ring-rotate"
            style={{ animationDuration: `${config.ring_rotate_seconds}s` }}
          />
          <div
            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border border-amber-200/15 rounded-full animate-ring-reverse"
            style={{ animationDuration: `${config.ring_reverse_seconds}s` }}
          />
        </div>
      )}

      {config.corner_decorations_enabled && (
        <div className="absolute inset-0 pointer-events-none z-[2] hidden md:block">
          <div className="absolute top-14 left-6 md:left-16 w-px h-10 bg-gradient-to-b from-amber-300 to-transparent" />
          <div className="absolute top-14 left-6 md:left-16 h-px w-8 bg-gradient-to-r from-amber-300 to-transparent" />
          <div className="absolute bottom-14 right-6 md:right-16 w-px h-10 bg-gradient-to-t from-amber-300 to-transparent" />
          <div className="absolute bottom-14 right-6 md:right-16 h-px w-8 bg-gradient-to-l from-amber-300 to-transparent" />
        </div>
      )}

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 text-center py-6 md:py-8">
        <div className={`mb-2 pt-1 ${anim("animate-hero-reveal animate-stagger-1")}`}>
          <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-sans tracking-[0.3em] uppercase">
            <span className="w-6 h-px bg-amber-400" />
            {config.top_label}
            <span className="w-6 h-px bg-amber-400" />
          </span>
        </div>

        <div className={`mb-3 ${anim("animate-hero-reveal animate-stagger-2")}`}>
          <div className="flex items-center justify-center gap-0 leading-none font-serif">
            <span
              className="text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-bold tracking-tighter leading-none pb-1 text-hero-gold"
              style={{ padding: "8px" }}
            >
              {config.title_left}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-400 italic font-light mx-1 md:mx-2 -translate-y-1 md:-translate-y-3">
              {config.title_middle}
            </span>
            <span
              className="text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-bold tracking-tighter leading-none pb-1 text-hero-gold"
              style={{ padding: "8px" }}
            >
              {config.title_right}
            </span>
          </div>
        </div>

        <div className={`flex justify-center mb-4 ${anim("animate-hero-reveal animate-stagger-3")}`}>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        <div className={`mb-2 ${anim("animate-hero-reveal animate-stagger-4")}`}>
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-white font-light tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {config.tagline_plain}{" "}
            <em className="text-amber-300 not-italic font-normal">{config.tagline_emphasis}</em>
          </p>
        </div>

        <div className={`mb-3 ${anim("animate-hero-reveal animate-stagger-5")}`}>
          <p className="text-xs md:text-sm font-sans text-gray-300 tracking-[0.15em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            {config.subtitle_upper}
          </p>
        </div>

        <div className={`max-w-lg mx-auto mb-5 ${anim("animate-hero-reveal animate-stagger-6")}`}>
          <div className="relative px-5 py-3 border border-amber-400/40 bg-black/30 backdrop-blur-sm rounded-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="text-amber-400 text-xl font-serif">&ldquo;</span>
            </div>
            <p className="text-sm md:text-base font-serif italic text-gray-200 leading-relaxed">
              {config.quote_text}
            </p>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 ${anim("animate-hero-reveal animate-stagger-7")}`}>
          {config.ctas.map((cta, idx) => (
            <CtaButton key={`${cta.href}-${idx}`} cta={cta} />
          ))}
        </div>

        <div className={`pb-2 ${anim("animate-hero-reveal animate-stagger-8")}`}>
          <div className="flex items-center justify-center gap-2 text-xs font-sans text-gray-400 tracking-wide flex-wrap">
            <span className="w-4 h-px bg-gray-500" />
            {config.hashtags.map((tag, i) => (
              <span key={`${tag}-${i}`}>
                {i > 0 && <span className="text-amber-400/60 mx-1">·</span>}
                {tag}
              </span>
            ))}
            <span className="w-4 h-px bg-gray-500" />
          </div>
        </div>
      </div>

      {config.scroll_indicator_enabled && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none">
          <span className="block text-[10px] font-sans font-medium text-amber-200/95 tracking-[0.3em] uppercase pl-[0.3em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            Scroll
          </span>
          <div className="w-px h-6 bg-gray-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-amber-400 to-transparent animate-bounce" />
          </div>
        </div>
      )}
    </section>
  );
}
