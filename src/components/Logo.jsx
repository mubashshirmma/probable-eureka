import React, { useEffect, useId, useState } from 'react';
import { SHELL_FRAMES, CORE_FRAMES } from './flameFrames';

// Smooth, slightly uneven timing so the flicker never feels mechanical. Each loop ends on its first frame.
const SHELL_TIMES = '0;0.14;0.31;0.47;0.66;0.83;1';
const CORE_TIMES = '0;0.2;0.42;0.65;0.84;1';
const ease = (frames) => Array(frames - 1).fill('0.35 0.05 0.65 0.95').join(';');

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [reduce, setReduce] = useState(() => (supported ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (!supported) return undefined;
    const mq = window.matchMedia(query);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [supported]);
  return reduce;
}

/**
 * Brand logo: a solid emblem with a flame rising from an open book cut out of it
 * (true transparent negative space, so the page shows through), then the wordmark.
 * No background plate: it sits directly on whatever surface it is placed on.
 *
 * The flame is alive: its outline morphs between hand-tuned shapes (SVG path animation) so the tips
 * sway and flicker at different moments, the core pulses out of phase, and one spark rises.
 * The circle and the wordmark stay still. Hovering the logo gives a small lift.
 * With prefers-reduced-motion the flame is drawn static (no animation elements are rendered at all).
 *
 * Props
 *   size      'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fluid'   scales the whole logo (it is built in em units)
 *   tone      'light' (navy on light surfaces, default) | 'dark' (white on dark surfaces)
 *   name      wordmark text
 *   showName  false shows the emblem alone
 *   animated  false freezes the flame
 */
export default function Logo({
  size = 'md',
  tone = 'light',
  name = 'StudyHelp',
  showName = true,
  animated = true,
  className = '',
}) {
  const id = useId().replace(/:/g, '');
  const reduceMotion = usePrefersReducedMotion();
  const live = animated && !reduceMotion;
  const maskId = `${id}-cut`;

  const classes = [
    'sh-logo',
    `sh-logo--${size}`,
    tone === 'dark' ? 'sh-logo--dark' : '',
    live ? 'is-animated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <svg className="sh-logo__emblem" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <defs>
          {/* White keeps the circle, black cuts it away. The cut-outs are real transparency. */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
            <rect width="48" height="48" fill="#fff" />

            {/* Flame shell: the outline morphs through SHELL_FRAMES */}
            <g className="sh-logo__flame">
              <path fill="#000" d={SHELL_FRAMES[0]}>
                {live && (
                  <animate
                    attributeName="d"
                    dur="4.3s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes={SHELL_TIMES}
                    keySplines={ease(SHELL_FRAMES.length)}
                    values={SHELL_FRAMES.join(';')}
                  />
                )}
              </path>
              {/* Flame core: white again, so the flame reads as an outline with a heart. It pulses on its own, slower beat. */}
              <path className="sh-logo__core" fill="#fff" d={CORE_FRAMES[0]}>
                {live && (
                  <>
                    <animate
                      attributeName="d"
                      dur="3.1s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keyTimes={CORE_TIMES}
                      keySplines={ease(CORE_FRAMES.length)}
                      values={CORE_FRAMES.join(';')}
                    />
                    <animate attributeName="opacity" dur="2.3s" repeatCount="indefinite" values="1;0.78;1;0.88;1" />
                  </>
                )}
              </path>
            </g>

            {/* Open book under the flame */}
            <path
              fill="none"
              stroke="#000"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.6 36.4c4.4 3.6 9.2 3.6 12.4.7 3.2 2.9 8 2.9 12.4-.7"
            />

            {/* One rising spark */}
            <path className="sh-logo__spark" fill="#000" d="M34.4 10.2l1.15 2.65 2.65 1.15-2.65 1.15-1.15 2.65-1.15-2.65-2.65-1.15 2.65-1.15z" />
          </mask>
        </defs>
        <circle cx="24" cy="24" r="22" fill="currentColor" mask={`url(#${maskId})`} />
      </svg>
      {showName && <span className="sh-logo__word">{name}</span>}
    </span>
  );
}
