import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { fetchHomeHeroConfig } from "../../services/cmsApi";
import {
  DEFAULT_HOME_HERO,
  mergeHomeHeroFromApi,
  type HomeHeroConfig,
  type HomeHeroCta,
} from "../../types/homeHeroCms";
import fallbackHeroImg from "../../mocks/Home.jpg";
import heroImg from "../../../public/images/globel.png";

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
      opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
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
        opacity: Math.random() * 0.6 + 0.2,
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
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

function HeroCtaLink({ cta }: { cta: HomeHeroCta }) {
  const primary =
    "group inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-sans font-semibold text-sm tracking-wide rounded-full hover:bg-amber-600 transition-all duration-300 hover:gap-4 hover:scale-105 hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]";
  const outline =
    "group inline-flex items-center gap-2 px-6 py-3 border-2 border-amber-400/70 text-amber-300 font-sans font-semibold text-sm tracking-wide rounded-full hover:bg-amber-500/20 transition-all duration-300 hover:border-amber-400 hover:gap-4 hover:scale-105 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)]";
  const cls = cta.variant === "outline" ? outline : primary;
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

export default function Home() {
  const [hero, setHero] = useState<HomeHeroConfig>(DEFAULT_HOME_HERO);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchHomeHeroConfig().then((data) => {
      if (!cancelled) setHero(mergeHomeHeroFromApi(data));
    });
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const heroBg =
    hero.background_image_resolved_url || hero.background_image_url || fallbackHeroImg;
  const cta = hero.cta_section;
  const phrases = hero.marquee_phrases;
  const reveal = (stagger: string) =>
    heroLoaded ? `animate-hero-reveal ${stagger} opacity-0` : "opacity-0";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative flex items-center justify-center overflow-hidden pt-16 md:pt-20 min-h-[320px] md:min-h-[360px] lg:min-h-[400px]">
        <img
          src={heroBg}
          alt="Refex Group Leadership"
          className="hidden md:block absolute w-full h-full object-cover md:object-cover object-top"
        />

        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.12)_0%,_transparent_70%)] pointer-events-none" />

        <div className="absolute inset-0">
          <ParticleField />
        </div>

        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="absolute top-[15%] right-[10%] w-[250px] h-[250px] bg-amber-100/20 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[20%] left-[8%] w-[200px] h-[200px] bg-amber-50/30 rounded-full blur-[80px] animate-float-medium" />
          <div className="absolute top-[45%] left-[55%] w-[120px] h-[120px] bg-amber-100/15 rounded-full blur-[60px] animate-pulse-glow" />
        </div>

        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden flex items-center justify-center">
          <div
            className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] border border-amber-300/20 rounded-full animate-ring-rotate"
            style={{ animationDuration: "40s" }}
          />
          <div
            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border border-amber-200/15 rounded-full animate-ring-reverse"
            style={{ animationDuration: "30s" }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="absolute top-14 left-6 md:left-16 w-px h-10 bg-gradient-to-b from-amber-300 to-transparent" />
          <div className="absolute top-14 left-6 md:left-16 h-px w-8 bg-gradient-to-r from-amber-300 to-transparent" />
          <div className="absolute bottom-14 right-6 md:right-16 w-px h-10 bg-gradient-to-t from-amber-300 to-transparent" />
          <div className="absolute bottom-14 right-6 md:right-16 h-px w-8 bg-gradient-to-l from-amber-300 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 text-center py-6 md:py-8">
          <div className={`mb-2 pt-4 md:pt-1 ${reveal("animate-stagger-1")}`}>
            <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-sans tracking-[0.3em] uppercase">
              <span className="w-6 h-px bg-amber-400" />
              {hero.top_label}
              <span className="w-6 h-px bg-amber-400" />
            </span>
          </div>

          <div className={`mb-3 ${reveal("animate-stagger-2")}`}>
            <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 leading-none font-serif">
              <span
                className="text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-bold tracking-tighter leading-none pb-1 animate-shimmer-text"
                style={{ padding: "8px" }}
              >
                {hero.title_left}
              </span>
              <span className="flex shrink-0 items-center justify-center self-center mx-0.5 sm:mx-1 md:mx-2">
                <span className="relative flex h-11 w-11 sm:h-14 sm:w-14 md:h-[4.5rem] md:w-[4.5rem] lg:h-20 lg:w-20 items-center justify-center rounded-full border border-amber-400/35 bg-black/25 shadow-[0_0_24px_rgba(212,175,55,0.15)]">
                  <img
                    src={heroImg}
                    alt=""
                    className="h-[88%] w-[88%] rounded-full object-contain animate-ring-rotate"
                    style={{ animationDuration: "14s" }}
                  />
                </span>
              </span>
              <span
                className="text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-bold tracking-tighter leading-none pb-1 animate-shimmer-text"
                style={{ padding: "8px" }}
              >
                {hero.title_right}
              </span>
            </div>
          </div>

          <div className={`flex justify-center mb-4 ${reveal("animate-stagger-3")}`}>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>

          <div className={`mb-2 ${reveal("animate-stagger-4")}`}>
            <p className="text-sm md:text-base lg:text-lg font-sans text-white font-light tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              {hero.tagline_plain}{" "}
              <em className="text-amber-300 not-italic font-normal">{hero.tagline_emphasis}</em>
            </p>
          </div>

          <div className={`mb-3 ${reveal("animate-stagger-5")}`}>
             
            <p className="text-xs md:text-sm font-sans text-gray-300 tracking-[0.15em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              {hero.subtitle_upper}
            </p>
          </div>

          <div className={`w-full max-w-[min(100%,42rem)] sm:max-w-xl mx-auto mb-5 px-1 sm:px-0 ${reveal("animate-stagger-6")}`}>
            <div className="relative w-full px-4 py-2.5 sm:px-5 border border-amber-400/40 bg-black/30 backdrop-blur-sm rounded-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span className="text-amber-400 text-xl font-sans">&ldquo;</span>
              </div>
              <p className="text-sm md:text-base font-serif italic text-gray-200 leading-relaxed text-center whitespace-normal break-words">
                {hero.quote_text}
              </p>
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 ${reveal("animate-stagger-7")}`}>
            {hero.ctas.map((item, idx) => (
              <HeroCtaLink key={`${item.href}-${idx}`} cta={item} />
            ))}
          </div>

          <div className={reveal("animate-stagger-8")}>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-sans text-gray-300 tracking-wide px-2">
              <span className="hidden sm:block w-4 h-px bg-gray-500 shrink-0" />
              {hero.hashtags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="contents">
                  {i > 0 && <span className="text-amber-400/60">·</span>}
                  <span>{tag}</span>
                </span>
              ))}
              <span className="hidden sm:block w-4 h-px bg-gray-500 shrink-0" />
            </div>
          </div>

          {/* <div
            className={`mt-5 md:mt-7 flex flex-col items-center gap-1.5 pointer-events-none ${
              heroLoaded ? "animate-hero-reveal opacity-0" : "opacity-0"
            }`}
            style={{ animationDelay: "1.25s" }}
          >
            <span className="block text-[10px] font-sans font-medium text-amber-200/95 tracking-[0.3em] uppercase pl-[0.3em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
              Scroll
            </span>
            <div className="w-px h-7 bg-amber-400/50 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-b from-amber-300 to-transparent animate-bounce" />
            </div>
          </div> */}
        </div>
      </section>

      <section className="relative py-3 overflow-hidden bg-white border-t border-amber-100/30">
        <div className="flex animate-marquee whitespace-nowrap relative z-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              {phrases.flatMap((phrase, j) => [
                j > 0 ? (
                  <span key={`dot-${i}-${j}`} className="text-amber-300/60">
                    ·
                  </span>
                ) : null,
                <span
                  key={`phrase-${i}-${j}`}
                  className="text-amber-600 font-sans text-sm font-semibold tracking-wide"
                >
                  {phrase}
                </span>,
              ])}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-10 md:py-14 px-6 md:px-16 lg:px-24 relative overflow-hidden border-t border-amber-100/30">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-amber-400/40" />
              <span className="text-amber-600 text-xs tracking-[0.3em] uppercase">
                {cta.eyebrow}
              </span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-amber-400/40" />
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h2 className="text-2xl md:text-3xl font-semibold  font-sans text-gray-900 mb-3 leading-tight">
              {cta.title_plain}
              <em className="text-gradient-gold not-italic ">{cta.title_emphasis}</em>
              {cta.title_after}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-sm font-sans  text-gray-500 max-w-2xl mx-auto mb-6 leading-relaxed">
              {cta.body}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            {cta.button_href.startsWith("/") ? (
              <Link
                to={cta.button_href}
                className="group inline-flex items-center gap-3 px-8 py-3 bg-amber-500 text-white font-sans font-semibold text-sm tracking-wide rounded-full hover:bg-amber-600 transition-all duration-300 hover:gap-5 hover:scale-105 hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]"
              >
                <span>{cta.button_label}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <a
                href={cta.button_href}
                className="group inline-flex items-center gap-3 px-8 py-3 bg-amber-500 text-white font-sans font-semibold text-sm tracking-wide rounded-full hover:bg-amber-600 transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{cta.button_label}</span>
                <span>→</span>
              </a>
            )}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
