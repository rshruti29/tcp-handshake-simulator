"use client";

// The textbook timing diagram: time runs downward, each packet is a sloped arrow.
// It is drawn live from the same state as the wire above, and arrows are clickable.

import type { KeyboardEvent } from "react";
import type { PacketPhase } from "@/types/tcp";
import { ESTABLISHED_INDEX, FLAG_STYLES, HANDSHAKE_STEPS } from "@/utils/handshake";
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

interface SequenceDiagramProps {
  stepIndex: number;
  phase: PacketPhase;
  progress: number;
  selectedPacketId: number | null;
  onSelectPacket: (packetId: number) => void;
}

export default function SequenceDiagram({
  stepIndex,
  phase,
  progress,
  selectedPacketId,
  onSelectPacket,
}: SequenceDiagramProps) {
  const isEstablished = stepIndex >= ESTABLISHED_INDEX;
  const lastArrowEnd = getArrowCoords(2, "Client").y2; // where the final ACK lands

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-base font-semibold">Timing diagram</h2>
      <p className="mt-1 text-sm text-muted">Time runs downward. Click an arrow to inspect that packet.</p>

      <svg
        viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
        className="mx-auto mt-4 w-full max-w-sm"
        role="img"
        aria-label="Timing diagram of the TCP three-way handshake"
      >
        {/* Host names */}
        <text x={CLIENT_X} y={20} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
          Client
        </text>
        <text x={SERVER_X} y={20} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
          Server
        </text>

        {/* Lifelines (one vertical line per computer) */}
        <line x1={CLIENT_X} y1={LIFELINE_TOP} x2={CLIENT_X} y2={LIFELINE_BOTTOM} strokeWidth={2} className="stroke-line" />
        <line x1={SERVER_X} y1={LIFELINE_TOP} x2={SERVER_X} y2={LIFELINE_BOTTOM} strokeWidth={2} className="stroke-line" />

        {/* After the handshake the lifelines turn green: the connection is open */}
        {isEstablished && (
          <g>
            <line x1={CLIENT_X} y1={lastArrowEnd} x2={CLIENT_X} y2={LIFELINE_BOTTOM} strokeWidth={3} className="stroke-ok" />
            <line x1={SERVER_X} y1={lastArrowEnd} x2={SERVER_X} y2={LIFELINE_BOTTOM} strokeWidth={3} className="stroke-ok" />
            <text x={DIAGRAM_WIDTH / 2} y={LIFELINE_BOTTOM + 24} textAnchor="middle" className="fill-ok text-[13px] font-semibold">
              Connection Established
            </text>
          </g>
        )}

        {/* One arrow per packet sent so far */}
        {HANDSHAKE_STEPS.map((step, index) => {
          if (index > stepIndex) return null; // not sent yet

          const { packet } = step;
          const styles = FLAG_STYLES[packet.flag];
          const full = getArrowCoords(index, packet.source);

          // The current packet's arrow grows as the packet travels.
          const isTravelling = index === stepIndex && phase === "inFlight" && !isEstablished;
          const fraction = isTravelling ? progress / 100 : 1;
          const x2 = full.x1 + (full.x2 - full.x1) * fraction;
          const y2 = full.y1 + (full.y2 - full.y1) * fraction;

          const isSelected = selectedPacketId === packet.id;
          const midX = (full.x1 + full.x2) / 2;
          const midY = (full.y1 + full.y2) / 2;
          const angle = labelAngle(full.x1, full.y1, full.x2, full.y2);
          const numbers =
            packet.acknowledgementNumber === null
              ? `seq=${packet.sequenceNumber}`
              : `seq=${packet.sequenceNumber}, ack=${packet.acknowledgementNumber}`;

          const select = () => onSelectPacket(packet.id);
          const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              select();
            }
          };

          return (
            <g
              key={packet.id}
              role="button"
              tabIndex={0}
              aria-label={`${packet.flag} from ${packet.source} to ${packet.destination}. Show details`}
              onClick={select}
              onKeyDown={onKeyDown}
              className="group cursor-pointer outline-none"
            >
              {/* Wide invisible line makes the arrow easy to click; it shows on keyboard focus */}
              <line
                x1={full.x1}
                y1={full.y1}
                x2={full.x2}
                y2={full.y2}
                strokeWidth={18}
                strokeLinecap="round"
                className="stroke-transparent group-focus-visible:stroke-line"
              />

              <line
                x1={full.x1}
                y1={full.y1}
                x2={x2}
                y2={y2}
                strokeWidth={isSelected ? 4 : 2.25}
                strokeLinecap="round"
                className={`${styles.stroke} transition-[stroke-width]`}
              />

              {fraction >= 1 ? (
                <polygon points={arrowHeadPoints(full.x1, full.y1, full.x2, full.y2, isSelected ? 12 : 10)} className={styles.fill} />
              ) : (
                <circle cx={x2} cy={y2} r={5} className={styles.fill} />
              )}

              {/* Labels sit along the arrow: flag above, numbers below */}
              <g transform={`rotate(${angle} ${midX} ${midY})`}>
                <text x={midX} y={midY - 8} textAnchor="middle" className={`${styles.fill} font-mono text-[12px] font-semibold`}>
                  {packet.flag}
                </text>
                <text x={midX} y={midY + 16} textAnchor="middle" className="fill-muted font-mono text-[10px]">
                  {numbers}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
