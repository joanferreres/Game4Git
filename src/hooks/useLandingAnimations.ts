import { useEffect, type RefObject } from "react";

type GsapModule = typeof import("gsap").gsap;
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger").ScrollTrigger;

const loadGsap = async (): Promise<{ gsap: GsapModule; ScrollTrigger: ScrollTriggerModule }> => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};

const scheduleIdle = (run: () => void) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const id = window.requestIdleCallback(run, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const t = window.setTimeout(run, 100);
  return () => window.clearTimeout(t);
};

export function useHomeLandingAnimations(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    const start = () => {
      void loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !rootRef.current) return;

        const mm = gsap.matchMedia();
        mm.add(
          {
            animate: "(prefers-reduced-motion: no-preference)",
            desktop: "(min-width: 640px)",
          },
          (ctx) => {
            const { animate, desktop } = ctx.conditions as {
              animate: boolean;
              desktop: boolean;
            };
            if (!animate || !desktop) {
              gsap.set("[data-home-header], .home-guide-card, .home-faq-item", {
                clearProps: "all",
              });
              return;
            }

            gsap.set("[data-home-header]", { y: 12, opacity: 1, visibility: "visible" });
            gsap.set(".home-guide-card, .home-faq-item", { y: 20, opacity: 0 });

            gsap.to("[data-home-header]", { y: 0, duration: 0.35, ease: "power2.out" });

            ScrollTrigger.batch(".home-guide-card", {
              start: "top 90%",
              once: true,
              interval: 0.06,
              onEnter: (batch) => {
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  duration: 0.45,
                  stagger: 0.05,
                  ease: "power2.out",
                });
              },
            });

            ScrollTrigger.batch(".home-faq-item", {
              start: "top 92%",
              once: true,
              interval: 0.06,
              onEnter: (batch) => {
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  stagger: 0.04,
                  ease: "power2.out",
                });
              },
            });
          },
          root
        );

        revert = () => mm.revert();
      });
    };

    const cancelIdle = scheduleIdle(start);
    return () => {
      cancelled = true;
      cancelIdle();
      revert?.();
    };
  }, [rootRef]);
}

export function useSeoLandingAnimations(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    const start = () => {
      void loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !rootRef.current) return;

        const mm = gsap.matchMedia();
        const landingTargets =
          "[data-landing-header], [data-landing-hero-chunk], [data-landing-reveal]";

        mm.add("(max-width: 639px), (prefers-reduced-motion: reduce)", () => {
          gsap.set(landingTargets, { clearProps: "all" });
        }, root);

        mm.add("(min-width: 640px) and (prefers-reduced-motion: no-preference)", () => {
          gsap.set("[data-landing-header]", { opacity: 1, visibility: "visible", y: 10 });
          gsap.set("[data-landing-hero-chunk]", { opacity: 1, visibility: "visible", y: 20 });
          gsap.set("[data-landing-reveal]", { opacity: 1, visibility: "visible", y: 28 });

          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
          tl.to("[data-landing-header]", { y: 0, duration: 0.3 }, 0);
          tl.to(
            "[data-landing-hero-left] [data-landing-hero-chunk]",
            { y: 0, duration: 0.45, stagger: 0.05 },
            "<0.05"
          );
          tl.to(
            "[data-landing-hero-right] [data-landing-hero-chunk]",
            { y: 0, duration: 0.42, stagger: 0.05 },
            "<0.08"
          );

          ScrollTrigger.batch("[data-landing-reveal]", {
            start: "top 92%",
            once: true,
            interval: 0.06,
            onEnter: (batch) => {
              gsap.to(batch, {
                y: 0,
                duration: 0.5,
                stagger: { each: 0.04, ease: "power1.out" },
                ease: "power2.out",
                overwrite: "auto",
              });
            },
          });
        }, root);

        revert = () => mm.revert();
      });
    };

    const cancelIdle = scheduleIdle(start);
    return () => {
      cancelled = true;
      cancelIdle();
      revert?.();
    };
  }, [rootRef, enabled]);
}
