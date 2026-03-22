"use client";

import { useEffect } from "react";

// Module-level helper: animateCounters lives here so the nesting depth
// (module → forEach → onUpdate) stays at 3 — well within SonarQube's limit of 4.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateCounters(gsapInstance: any) {
  document.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
    const target = Number.parseInt(el.dataset["countTo"] ?? "0", 10);
    const obj = { val: 0 };
    gsapInstance.to(obj, {
      val: target, duration: 2.4, ease: "power2.out",
      immediateRender: false,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate() { el.textContent = Math.round(obj.val).toString(); },
    });
  });
}

/**
 * Tiny client component — renders nothing, only runs GSAP animations.
 * GSAP is dynamically imported inside useEffect so it NEVER blocks the
 * initial HTML paint (LCP) or hydration (TBT/TTI).
 */
export default function GsapAnimations() {
  useEffect(() => {
    const prefersReducedMotion = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Defined here (level 2) so the forEach inside is only level 3 — within SonarQube limit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Extracted to avoid nesting > 4 levels inside gsap.context callback
      function startFloatAnimations() {
        gsap.to("[data-hero='mockup']",  { y: -14, duration: 5,   repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-float='notif']",  { y: -8,  duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-float='deploy']", { y: 8,   duration: 4.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
      }

      ctx = gsap.context(() => {

        // ── NAV ──────────────────────────────────────────────────────
        gsap.from("[data-gsap='nav']", {
          y: -70, opacity: 0,
          duration: 0.9, ease: "power3.out", delay: 0.15,
        });

        // ── ORBS (continuous float) ───────────────────────────────────
        gsap.to("[data-orb='1']", { y: -50, x: 25, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-orb='2']", { y: 35, x: -30, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
        gsap.to("[data-orb='3']", { y: -30, x: 40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 4 });

        // ── HERO TIMELINE ─────────────────────────────────────────────
        const heroTl = gsap.timeline({ delay: 0.3 });
        heroTl
          .from("[data-hero='badge']", { y: -25, opacity: 0, duration: 0.7, ease: "back.out(2)" })
          .from("[data-hero='word']", {
            y: 100, opacity: 0, rotationX: -70,
            transformOrigin: "0% 50% -50",
            duration: 0.9, stagger: 0.07, ease: "back.out(1.3)",
          }, "-=0.2")
          .from("[data-hero='sub']", { y: 35, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
          .from("[data-hero='cta']", { y: 25, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }, "-=0.35")
          .from("[data-hero='stat']", { y: 30, opacity: 0, scale: 0.88, duration: 0.55, stagger: 0.09, ease: "back.out(1.6)" }, "-=0.3")
          .from("[data-hero='mockup']", { x: 90, opacity: 0, duration: 1.1, ease: "power3.out" }, 0.4)
          .call(startFloatAnimations);

        gsap.to("[data-hero='scroll']", { y: 12, opacity: 0.15, duration: 1.5, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 3.5 });

        // ── SERVICES ─────────────────────────────────────────────────
        // immediateRender: false → elementos ficam visíveis até a animação disparar
        gsap.from("[data-gsap='services-label']",   { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='services']", start: "top 80%" }, x: -40, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-gsap='services-heading']", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='services']", start: "top 78%" }, y: 50,  opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from("[data-gsap='service-card']",     { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='services']", start: "top 70%" }, y: 80,  opacity: 0, scale: 0.9, duration: 0.85, stagger: 0.15, ease: "back.out(1.2)" });

        // ── STATS ─────────────────────────────────────────────────────
        gsap.from("[data-gsap='stat-card']", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='stats']", start: "top 82%" }, y: 50, opacity: 0, scale: 0.92, duration: 0.7, stagger: 0.1, ease: "back.out(1.4)" });
        animateCounters(gsap);

        // ── HOW IT WORKS ──────────────────────────────────────────────
        gsap.from("[data-gsap='steps-heading']", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='steps']", start: "top 80%" }, y: 50, opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from("[data-gsap='step']",          { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='steps']", start: "top 74%" }, x: -70, opacity: 0, duration: 0.75, stagger: 0.22, ease: "power3.out" });

        // ── PORTFOLIO ─────────────────────────────────────────────────
        gsap.from("[data-gsap='portfolio-heading']", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='portfolio']", start: "top 80%" }, y: 50, opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from("[data-gsap='project']",           { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='portfolio']", start: "top 74%" }, y: 90, opacity: 0, scale: 0.88, rotationY: 8, transformOrigin: "center center", duration: 0.9, stagger: 0.18, ease: "back.out(1.1)" });

        // ── CTA ───────────────────────────────────────────────────────
        gsap.from("[data-gsap='cta-inner'] > *", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='cta']", start: "top 80%" }, y: 55, opacity: 0, duration: 0.85, stagger: 0.15, ease: "power3.out" });

        // ── LEAD ──────────────────────────────────────────────────────
        gsap.from("[data-gsap='lead-left'] > *", { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='lead']", start: "top 80%" }, x: -50, opacity: 0, duration: 0.75, stagger: 0.12, ease: "power3.out" });
        gsap.from("[data-gsap='lead-form']",     { immediateRender: false, scrollTrigger: { trigger: "[data-gsap='lead']", start: "top 78%" }, x: 60,  opacity: 0, duration: 0.85, ease: "power3.out" });

      });

      // Recalcula as posições de scroll após o GSAP ter sido carregado de forma
      // lazy — sem isso, ScrollTrigger pode ter medições erradas do DOM e os
      // elementos ficam presos no estado `from` (opacity: 0) para sempre.
      ScrollTrigger.refresh();
    })();

    return () => ctx?.revert();
  }, []);

  return null;
}
