import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const ring2 = ring2Ref.current;
    if (!dot || !ring || !ring2) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let ring2X = 0;
    let ring2Y = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Track hoverable elements
    const handleElementMouseEnter = () => setIsHovering(true);
    const handleElementMouseLeave = () => setIsHovering(false);

    const addHoverListeners = () => {
      const hoverables = document.querySelectorAll("a, button, [role='button'], input, textarea, select, .cursor-hover");
      hoverables.forEach((el) => {
        el.addEventListener("mouseenter", handleElementMouseEnter);
        el.addEventListener("mouseleave", handleElementMouseLeave);
      });
    };

    const animate = () => {
      // Smooth lerp for ring 1
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      // Slower lerp for ring 2 (trailing effect)
      ring2X += (mouseX - ring2X) * 0.08;
      ring2Y += (mouseY - ring2Y) * 0.08;

      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      ring.style.transform = `translate(${ringX - (isHovering ? 28 : 14)}px, ${ringY - (isHovering ? 28 : 14)}px)`;
      ring2.style.transform = `translate(${ring2X - 24}px, ${ring2Y - 24}px)`;

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    addHoverListeners();

    // Re-attach listeners when DOM changes
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isHovering, isVisible]);

  // Hide on mobile/touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Core dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-refex-gold pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform" }}
      />

      {/* Inner ring - follows with slight delay */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border pointer-events-none z-[9998] transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isHovering
            ? "w-14 h-14 border-refex-gold/60 bg-refex-gold/10"
            : "w-7 h-7 border-refex-gold/40"
        }`}
        style={{ willChange: "transform" }}
      />

      {/* Outer glow ring - trails behind */}
      <div
        ref={ring2Ref}
        className={`fixed top-0 left-0 w-12 h-12 rounded-full border border-refex-gold/20 pointer-events-none z-[9997] transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          willChange: "transform",
          boxShadow: isHovering
            ? "0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.1)"
            : "0 0 10px rgba(201,168,76,0.15)",
          transition: "box-shadow 0.3s ease, opacity 0.5s ease",
        }}
      />
    </>
  );
}