import React, { useEffect, useRef } from "react";

type Commit = {
  id: string;
  x: number;
  y: number;
  color: string;
  hash: string;
  message: string;
};

const MAIN_X = 450;
const FEAT_X = 250;
const BUGFIX_X = 650;

const COMMITS: Commit[] = [
  { id: "c1", x: MAIN_X, y: 70, color: "#f05133", hash: "a1b2c3d", message: "chore: init repo" },
  { id: "c2", x: MAIN_X, y: 150, color: "#f05133", hash: "d4e5f6a", message: "feat: base layout" },
  { id: "f1", x: FEAT_X, y: 230, color: "#4caf50", hash: "7a8b9c0", message: "feat(auth): login form" },
  { id: "f2", x: FEAT_X, y: 310, color: "#4caf50", hash: "2d3e4f5", message: "feat(auth): tokens" },
  { id: "c3", x: MAIN_X, y: 360, color: "#f05133", hash: "9e8d7c6", message: "merge: auth → main" },
  { id: "b1", x: BUGFIX_X, y: 430, color: "#ff9800", hash: "5b4a3c2", message: "fix: null pointer" },
  { id: "c4", x: MAIN_X, y: 480, color: "#f05133", hash: "1f2e3d4", message: "merge: fix → main" },
  { id: "c5", x: MAIN_X, y: 570, color: "#f05133", hash: "8c9d0e1", message: "release: v1.0.0" },
];

const GitBranchScrollAnimation: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let revertMedia: (() => void) | undefined;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled || !rootRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const paths = gsap.utils.toArray<SVGPathElement>(
          root.querySelectorAll(".git-scroll-path")
        );
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, {
            strokeDasharray: len,
            strokeDashoffset: len,
          });
        });
        gsap.set(root.querySelectorAll(".git-scroll-commit"), {
          scale: 0,
          transformOrigin: "center",
        });
        gsap.set(root.querySelectorAll(".git-scroll-msg"), {
          autoAlpha: 0,
          x: -6,
        });
        gsap.set(root.querySelectorAll(".git-scroll-label"), {
          autoAlpha: 0,
          y: 6,
        });

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power1.out" },
        });

        const scope = (sel: string) => root.querySelectorAll(sel);

        const drawPath = (name: string, duration = 0.32) =>
          tl.to(
            scope(`[data-path='${name}']`),
            { strokeDashoffset: 0, duration, ease: "none" },
            ">"
          );

        const popCommit = (
          id: string,
          position: string | number = ">-0.05"
        ) => {
          tl.to(
            scope(`[data-commit='${id}']`),
            { scale: 1, duration: 0.2, ease: "back.out(2.2)" },
            position
          ).to(
            scope(`[data-msg='${id}']`),
            { autoAlpha: 1, x: 0, duration: 0.2, ease: "power2.out" },
            "<0.03"
          );
        };

        const showLabel = (
          name: string,
          position: string | number = "<"
        ) => {
          tl.to(
            scope(`[data-label='${name}']`),
            { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" },
            position
          );
        };

        drawPath("main-1");
        popCommit("c1");
        drawPath("main-2");
        popCommit("c2");
        showLabel("main", "<");

        drawPath("feat-out");
        showLabel("feat", "<0.1");
        popCommit("f1");
        drawPath("feat-cont");
        popCommit("f2");

        drawPath("feat-merge");
        tl.to(
          scope("[data-path='main-3']"),
          { strokeDashoffset: 0, duration: 0.32, ease: "none" },
          "<"
        );
        popCommit("c3");

        drawPath("bugfix-out");
        showLabel("bugfix", "<0.1");
        popCommit("b1");

        drawPath("bugfix-merge");
        tl.to(
          scope("[data-path='main-4']"),
          { strokeDashoffset: 0, duration: 0.32, ease: "none" },
          "<"
        );
        popCommit("c4");

        drawPath("main-5");
        popCommit("c5");

        ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          once: true,
          onEnter: () => tl.play(),
        });
      });

      revertMedia = () => mm.revert();
    };

    void setup();

    return () => {
      cancelled = true;
      revertMedia?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-xl shadow-black/10 dark:shadow-black/40"
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-2 font-mono text-[10px] text-slate-500">
          Game4Git — git graph
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-[#1e293b] bg-[#0b1220]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <svg
          viewBox="0 0 900 630"
          className="block h-auto w-full"
          role="img"
          aria-hidden
        >
          <defs>
            <filter
              id="git-scroll-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="git-scroll-label" data-label="main">
            <rect
              x={MAIN_X + 22}
              y={18}
              rx={6}
              ry={6}
              width={78}
              height={26}
              fill="#f05133"
            />
            <text
              x={MAIN_X + 61}
              y={36}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="#ffffff"
            >
              main
            </text>
          </g>
          <g className="git-scroll-label" data-label="feat">
            <rect
              x={FEAT_X - 104}
              y={172}
              rx={6}
              ry={6}
              width={102}
              height={26}
              fill="#4caf50"
            />
            <text
              x={FEAT_X - 53}
              y={190}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="#06210b"
            >
              feature/auth
            </text>
          </g>
          <g className="git-scroll-label" data-label="bugfix">
            <rect
              x={BUGFIX_X + 10}
              y={380}
              rx={6}
              ry={6}
              width={96}
              height={26}
              fill="#ff9800"
            />
            <text
              x={BUGFIX_X + 58}
              y={398}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="#1a1308"
            >
              fix/bug-101
            </text>
          </g>

          <path
            className="git-scroll-path"
            data-path="main-1"
            d={`M ${MAIN_X} 20 L ${MAIN_X} 70`}
            stroke="#f05133"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="main-2"
            d={`M ${MAIN_X} 70 L ${MAIN_X} 150`}
            stroke="#f05133"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="feat-out"
            d={`M ${MAIN_X} 150 C ${MAIN_X} 200 ${FEAT_X} 180 ${FEAT_X} 230`}
            stroke="#4caf50"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="feat-cont"
            d={`M ${FEAT_X} 230 L ${FEAT_X} 310`}
            stroke="#4caf50"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="feat-merge"
            d={`M ${FEAT_X} 310 C ${FEAT_X} 355 ${MAIN_X} 320 ${MAIN_X} 360`}
            stroke="#4caf50"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="main-3"
            d={`M ${MAIN_X} 150 L ${MAIN_X} 360`}
            stroke="#f05133"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="bugfix-out"
            d={`M ${MAIN_X} 360 C ${MAIN_X} 400 ${BUGFIX_X} 390 ${BUGFIX_X} 430`}
            stroke="#ff9800"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="bugfix-merge"
            d={`M ${BUGFIX_X} 430 C ${BUGFIX_X} 470 ${MAIN_X} 445 ${MAIN_X} 480`}
            stroke="#ff9800"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="main-4"
            d={`M ${MAIN_X} 360 L ${MAIN_X} 480`}
            stroke="#f05133"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="git-scroll-path"
            data-path="main-5"
            d={`M ${MAIN_X} 480 L ${MAIN_X} 570`}
            stroke="#f05133"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {COMMITS.map((c) => {
            const msgOnLeft = c.x > MAIN_X;
            const msgX = msgOnLeft ? c.x - 18 : c.x + 18;
            const msgAnchor = msgOnLeft ? "end" : "start";
            return (
              <g key={c.id}>
                <circle
                  className="git-scroll-commit"
                  data-commit={c.id}
                  cx={c.x}
                  cy={c.y}
                  r={10}
                  fill={c.color}
                  stroke="#0b1220"
                  strokeWidth="3"
                  filter="url(#git-scroll-glow)"
                />
                <g className="git-scroll-msg" data-msg={c.id}>
                  <text
                    x={msgX}
                    y={c.y - 3}
                    textAnchor={msgAnchor}
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fill={c.color}
                  >
                    {c.hash}
                  </text>
                  <text
                    x={msgX}
                    y={c.y + 13}
                    textAnchor={msgAnchor}
                    fontSize="12"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fill="#e2e8f0"
                  >
                    {c.message}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default GitBranchScrollAnimation;
