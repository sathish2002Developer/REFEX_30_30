import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchVisionPageCms } from "../../services/cmsApi";
import { mergeVisionPageCms } from "../../types/visionCms";

// Floating gold particle
function FloatingParticle({ delay, size, left, top, duration }: {
  delay: number;
  size: number;
  left: string;
  top: string;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full bg-amber-400/20 pointer-events-none"
      style={{
        width: size,
        height: size,
        left,
        top,
        animation: `floatParticle ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function useCountUp(target: number, duration: number = 1500, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

function AnimatedMetric({ value, isVisible, duration = 1500 }: {
  value: string;
  isVisible: boolean;
  duration?: number;
}) {
  const match = value.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  const prefix = match?.[1] || "";
  const numericPart = match?.[2] || "0";
  const suffix = match?.[3] || "";
  const target = parseInt(numericPart, 10);
  const count = useCountUp(target, duration, isVisible);
  return <>{prefix}{count}{suffix}</>;
}

export default function Vision() {
  const [cfg, setCfg] = useState(() => mergeVisionPageCms(null));

  useEffect(() => {
    fetchVisionPageCms().then((d) => setCfg(mergeVisionPageCms(d)));
  }, []);

  const pillars = cfg.pillars_section.pillars;
  const dashboardMetrics = cfg.metrics;
  const heroBg = cfg.hero.background_image_resolved_url || cfg.hero.background_image_url;
  const leaderPortrait = cfg.leadership.portrait_resolved_url || cfg.leadership.portrait_url;

  const gridRef = useRef<HTMLDivElement>(null);
  const metricsSectionRef = useRef<HTMLDivElement>(null);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);

  // IntersectionObserver for metrics counter animation
  useEffect(() => {
    const el = metricsSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stagger card entrance animation
  useEffect(() => {
    const timers = [0, 1, 2, 3].map((_, i) =>
      setTimeout(() => {
        setVisibleCards(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxTilt = 12;
    const x = ((e.clientY - centerY) / (rect.height / 2)) * maxTilt;
    const y = ((centerX - e.clientX) / (rect.width / 2)) * maxTilt;
    setTilt({ x: Math.max(-maxTilt, Math.min(maxTilt, x)), y: Math.max(-maxTilt, Math.min(maxTilt, y)) });
  };

  const handleMouseLeave = () => {
    setIsHoveringGrid(false);
    setTilt({ x: 0, y: 0 });
  };

  const particles = [
    { delay: 0, size: 6, left: "8%", top: "15%", duration: 7 },
    { delay: 1.2, size: 4, left: "22%", top: "60%", duration: 9 },
    { delay: 0.5, size: 8, left: "45%", top: "10%", duration: 8 },
    { delay: 2, size: 5, left: "65%", top: "75%", duration: 6 },
    { delay: 0.8, size: 7, left: "78%", top: "25%", duration: 10 },
    { delay: 1.5, size: 4, left: "88%", top: "55%", duration: 7 },
    { delay: 0.3, size: 6, left: "55%", top: "85%", duration: 9 },
    { delay: 2.5, size: 3, left: "12%", top: "40%", duration: 8 },
    { delay: 1.8, size: 5, left: "92%", top: "12%", duration: 6 },
    { delay: 0.6, size: 4, left: "35%", top: "30%", duration: 10 },
    { delay: 3, size: 6, left: "70%", top: "45%", duration: 7 },
    { delay: 1.1, size: 5, left: "50%", top: "70%", duration: 8 },
  ];

  return (
    <div className="min-h-screen bg-refex-dark overflow-x-hidden">
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.7; }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmerGold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cardFlipIn {
          from { opacity: 0; transform: perspective(1000px) rotateX(-15deg) translateZ(-80px); }
          to { opacity: 1; transform: perspective(1000px) rotateX(0deg) translateZ(0); }
        }
        @keyframes rainDrop {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(120vh) translateX(var(--rain-drift, 0px)); opacity: 0; }
        }
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          25% { transform: translateY(-20px) scale(1.05); opacity: 0.4; }
          50% { transform: translateY(-45px) scale(0.95); opacity: 0.25; }
          75% { transform: translateY(-15px) scale(1.02); opacity: 0.35; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(201,168,76,0); }
          50% { box-shadow: 0 0 30px rgba(201,168,76,0.15); }
        }
        @keyframes spineFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes pillarSlideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes leadershipGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
        @keyframes metricSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-animate-1 { animation: heroFadeUp 0.8s ease-out 0.1s both; }
        .hero-animate-2 { animation: heroFadeUp 0.8s ease-out 0.25s both; }
        .hero-animate-3 { animation: heroFadeUp 0.8s ease-out 0.4s both; }
        .hero-animate-4 { animation: heroFadeUp 0.8s ease-out 0.55s both; }
        .hero-animate-5 { animation: heroFadeUp 0.8s ease-out 0.7s both; }
        .card-animate { animation: cardFlipIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      <Navbar />

      {/* Our Vision Section — Hero with 3D effects */}
      <section
        className="relative px-6 md:px-16 lg:px-24 overflow-hidden min-h-[600px] md:min-h-[720px] flex items-center justify-center"
      >
        {/* Background image — object-top to show full image from top */}
        <img
          src={heroBg}
          alt=""
          className="absolute w-full h-full object-cover object-top"
        />
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none bg-black"
          style={{ opacity: Math.min(1, Math.max(0, cfg.hero.overlay_opacity_percent / 100)) }}
        />

        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          {/* Rain Dots — slower, graceful falling with drift */}
          {cfg.hero.show_rain &&
            Array.from({ length: 30 }).map((_, i) => {
            const left = `${(i * 3.3) % 100}%`;
            const delay = (i * 0.12) % 6;
            const duration = 5 + (i % 5) * 1.5;
            const size = 2 + (i % 3);
            const drift = -15 + (i % 7) * 5;
            return (
              <div
                key={`rain-${i}`}
                className="absolute rounded-full bg-amber-400/30 pointer-events-none"
                style={{
                  width: size,
                  height: size,
                  left,
                  top: "-10px",
                  animation: `rainDrop ${duration}s ease-in-out ${delay}s infinite`,
                  ['--rain-drift' as string]: `${drift}px`,
                }}
              />
            );
          })}

          {/* Watermark */}
          {cfg.hero.show_watermark && (
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <span
              className="font-serif text-[100px] md:text-[160px] lg:text-[200px] font-bold tracking-tighter text-amber-500/[0.04] whitespace-nowrap"
              style={{ transform: "rotate(-8deg)" }}
            >
              {cfg.hero.watermark_text}
            </span>
          </div>
          )}

          {/* Subtle radial glow behind stats */}
          {cfg.hero.show_radial_blob && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 400,
              height: 400,
              right: "-5%",
              top: "10%",
              background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            }}
          />
          )}
        </div>

        <div className="flex flex-col items-center relative z-10">
          {/* Centered text content */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-3 hero-animate-1">
              <span className="text-refex-gold text-xs font-sans tracking-[0.3em] uppercase">
                {cfg.hero.eyebrow}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-serif text-refex-text mb-5 leading-tight hero-animate-2">
              {cfg.hero.headline_before}
              <em className="text-refex-gold relative inline-block">
                {cfg.hero.headline_emphasis}
                <span
                  className="absolute -inset-x-2 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
                  style={{ animation: "shimmerGold 3s ease-in-out infinite" }}
                />
              </em>
              {cfg.hero.headline_after}
            </h2>

            <div className="mb-5 hero-animate-3 max-w-2xl mx-auto">
              <p className="text-base font-serif italic text-refex-text/90 leading-relaxed">
                {cfg.hero.pull_quote}
              </p>
            </div>

            <div className="space-y-3 hero-animate-4 max-w-2xl mx-auto">
              {cfg.hero.paragraphs.map((para, pi) => (
                <p
                  key={pi}
                  className="text-sm font-sans text-refex-text-muted leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Metrics Dashboard */}
      <section ref={metricsSectionRef} className="bg-white py-12 md:py-16 px-6 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Dashboard Cards — horizontal row */}
          <div
            className="flex flex-col md:flex-row items-stretch justify-center gap-0 rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {dashboardMetrics.map((m, i) => (
              <div
                key={`${m.label}-${i}`}
                className={`group flex-1 min-w-0 flex flex-col items-center text-center px-4 py-7 md:py-10 relative transition-all duration-500 hover:bg-amber-50/30 cursor-default ${
                  i < dashboardMetrics.length - 1 ? "md:border-r border-gray-100" : ""
                } ${i < dashboardMetrics.length - 1 ? "border-b md:border-b-0 border-gray-100" : ""}`}
                style={{
                  animation: `metricSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) ${0.12 * i}s both`,
                }}
              >
                {/* Icon */}
                <div 
                style={{
                   fontSize:"70px"
                }}
                className="w-[70px] h-[70px] md:w-50 md:h-50 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 flex items-center justify-center text-refex-gold text-lg md:text-xl mb-3 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-amber-200/60 group-hover:border-amber-300/80 group-hover:scale-110 group-hover:shadow-[0_4px_24px_rgba(201,168,76,0.18)]">
                  <i className={m.icon}></i>
                </div>

                {/* Value — animated counter */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-serif text-refex-gold mb-1 tracking-tight leading-none tabular-nums">
                  <AnimatedMetric value={m.value} isVisible={metricsVisible} duration={m.duration} />
                </div>

                {/* Label */}
                <div className="text-xs md:text-sm font-sans font-medium text-gray-700 mb-1">
                  {m.label}
                </div>

                <div className="text-[10px] md:text-xs font-sans text-gray-500">{m.sublabel}</div>
                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-refex-gold/0 to-transparent group-hover:via-refex-gold/50 transition-all duration-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 30 By 30 Vision - Pillars */}
      <section className="bg-white py-14 md:py-20 px-6 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-10">
            <span className="text-refex-gold text-xs font-sans tracking-[0.3em] uppercase inline-block mb-3">
              {cfg.pillars_section.eyebrow}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-refex-text mb-3 leading-tight">
              {cfg.pillars_section.headline}
            </h2>
            <p className="text-sm font-sans text-refex-text-muted max-w-lg mx-auto">
              {cfg.pillars_section.subhead}
            </p>
          </div>

          {/* Pillars grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
            {pillars.map((p, i) => (
              <div
                key={p.num}
                className="group relative border border-gray-200 hover:border-refex-gold/40 rounded-xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-refex-gold/5 overflow-hidden z-10"
                style={{
                  background: "linear-gradient(165deg, #FFFFFF 0%, #FDFCFA 50%, #F8F6F2 100%)",
                  animation: `pillarSlideUp 0.8s cubic-bezier(0.22,1,0.36,1) ${0.15 * i}s both`,
                }}
              >
                {/* Gold left accent */}
                <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-transparent via-refex-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Top row: number + icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-refex-gold/10 border border-refex-gold/25 flex items-center justify-center text-refex-gold text-lg md:text-xl transition-all duration-500 group-hover:bg-refex-gold/15 group-hover:border-refex-gold/35 group-hover:scale-105">
                      <i className={p.icon}></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-sans text-refex-gold/70 tracking-[0.2em] uppercase font-medium">
                        Pillar {p.num}
                      </span>
                      <h3 className="text-lg md:text-xl font-serif text-refex-text leading-tight group-hover:text-refex-gold transition-colors duration-500">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-sans text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-500">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-200 bg-gray-50/50">
              <span className="w-1.5 h-1.5 rounded-full bg-refex-gold animate-pulse" />
              <span className="text-xs font-sans text-gray-400 tracking-wide">
                {cfg.pillars_section.bottom_strip}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Message */}
      <section className="py-12 md:py-16 px-6 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-3">
            <span className="text-refex-gold text-xs font-sans tracking-[0.3em] uppercase">
              {cfg.leadership.eyebrow}
            </span>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
            <div className="lg:w-56">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-refex-surface-light/30 shadow-lg">
                <img
                  src={leaderPortrait}
                  alt={cfg.leadership.portrait_alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="flex-1">
              <div
                className="text-5xl font-serif leading-none mb-3"
                style={{
                  background: "linear-gradient(90deg, #C9A84C 0%, #E8C96E 25%, #C9A84C 50%, #F0D78C 75%, #C9A84C 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmerGold 4s linear infinite",
                }}
              >
                &ldquo;
              </div>
              <p className="text-xl md:text-2xl font-serif text-refex-text mb-4 leading-tight">
                {cfg.leadership.headline_line1}
                <br />
                <strong className="text-refex-gold">{cfg.leadership.headline_emphasis_line2}</strong>
              </p>
              <div className="space-y-2 mb-6">
                {cfg.leadership.body_paragraphs.map((line, li) => (
                  <p
                    key={li}
                    className="text-sm font-sans text-refex-text-muted leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>
              {/* Gold divider line */}
              <div className="h-[2px] w-20 bg-gradient-to-r from-refex-gold via-amber-300 to-refex-gold mb-3 rounded-full" />
              <div className="text-xs font-sans text-refex-text-dim tracking-wide">
                {cfg.leadership.attribution}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}