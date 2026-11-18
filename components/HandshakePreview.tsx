"use client";

// Home page picture: the three handshake arrows draw themselves once, in order.

import { motion, useReducedMotion } from "framer-motion";
import { FLAG_STYLES, HANDSHAKE_STEPS } from "@/utils/handshake";
import {
  CLIENT_X,
  DIAGRAM_HEIGHT,
  DIAGRAM_WIDTH,
  LIFELINE_BOTTOM,
  LIFELINE_TOP,
  SERVER_X,
  arrowHeadPoints,
  getArrowCoords,
  labelAngle,
} from "@/utils/diagram";

const DRAW_TIME = 0.7; // seconds to draw one arrow
const STEP_DELAY = 0.9; // seconds between arrows

export default function HandshakePreview() {
  const reduceMotion = useReducedMotion();
  const lastArrowEnd = getArrowCoords(2, "Client").y2;
  const finishDelay = reduceMotion ? 0 : 2 * STEP_DELAY + DRAW_TIME;

  return (
    <figure className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <svg
        viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
        className="mx-auto w-full max-w-sm"
        role="img"
        aria-label="Client sends SYN, server replies SYN+ACK, client replies ACK"
      >
        <text x={CLIENT_X} y={20} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
          Client
        </text>
        <text x={SERVER_X} y={20} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
          Server
        </text>
        <line x1={CLIENT_X} y1={LIFELINE_TOP} x2={CLIENT_X} y2={LIFELINE_BOTTOM} strokeWidth={2} className="stroke-line" />
        <line x1={SERVER_X} y1={LIFELINE_TOP} x2={SERVER_X} y2={LIFELINE_BOTTOM} strokeWidth={2} className="stroke-line" />

        {HANDSHAKE_STEPS.map((step, index) => {
          const { packet } = step;
          const styles = FLAG_STYLES[packet.flag];
          const { x1, y1, x2, y2 } = getArrowCoords(index, packet.source);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const delay = reduceMotion ? 0 : 0.3 + index * STEP_DELAY;

          return (
            <g key={packet.id}>
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={2.25}
                strokeLinecap="round"
                className={styles.stroke}
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduceMotion ? 0 : DRAW_TIME, delay, ease: "easeInOut" }}
              />
              <motion.g
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: reduceMotion ? 0 : delay + DRAW_TIME }}
              >
                <polygon points={arrowHeadPoints(x1, y1, x2, y2, 10)} className={styles.fill} />
                <g transform={`rotate(${labelAngle(x1, y1, x2, y2)} ${midX} ${midY})`}>
                  <text x={midX} y={midY - 8} textAnchor="middle" className={`${styles.fill} font-mono text-[12px] font-semibold`}>
                    {packet.flag}
                  </text>
                </g>
              </motion.g>
            </g>
          );
        })}

        <motion.g
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: finishDelay }}
        >
          <line x1={CLIENT_X} y1={lastArrowEnd} x2={CLIENT_X} y2={LIFELINE_BOTTOM} strokeWidth={3} className="stroke-ok" />
          <line x1={SERVER_X} y1={lastArrowEnd} x2={SERVER_X} y2={LIFELINE_BOTTOM} strokeWidth={3} className="stroke-ok" />
          <text x={DIAGRAM_WIDTH / 2} y={LIFELINE_BOTTOM + 24} textAnchor="middle" className="fill-ok text-[13px] font-semibold">
            Connection Established
          </text>
        </motion.g>
      </svg>
      <figcaption className="mt-4 text-center text-sm text-muted">
        Three packets, one connection. Time runs downward.
      </figcaption>
    </figure>
  );
}
