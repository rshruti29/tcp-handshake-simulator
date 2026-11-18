// Geometry for the timing (ladder) diagrams drawn with SVG.
// The home page preview and the simulation diagram both use these numbers.

import type { Host } from "@/types/tcp";

export const DIAGRAM_WIDTH = 320;
export const DIAGRAM_HEIGHT = 300;

export const CLIENT_X = 60; // x position of the client's vertical line
export const SERVER_X = 260; // x position of the server's vertical line

export const LIFELINE_TOP = 34;
export const LIFELINE_BOTTOM = 262;

const FIRST_ARROW_Y = 62; // where the first arrow starts
const ARROW_SPACING = 64; // vertical gap between arrows
const ARROW_DROP = 44; // how far an arrow slopes down (time passing)

/** Start and end points of the arrow for a given step (0, 1 or 2). */
export function getArrowCoords(stepIndex: number, source: Host) {
  const y1 = FIRST_ARROW_Y + stepIndex * ARROW_SPACING;
  const y2 = y1 + ARROW_DROP;
  const fromClient = source === "Client";
  return {
    x1: fromClient ? CLIENT_X : SERVER_X,
    y1,
    x2: fromClient ? SERVER_X : CLIENT_X,
    y2,
  };
}

/** Points of a small triangle arrowhead at (x2, y2), pointing along the line. */
export function arrowHeadPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size = 9
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const spread = Math.PI / 7;
  const round = (n: number) => Math.round(n * 100) / 100;

  const leftX = x2 - size * Math.cos(angle - spread);
  const leftY = y2 - size * Math.sin(angle - spread);
  const rightX = x2 - size * Math.cos(angle + spread);
  const rightY = y2 - size * Math.sin(angle + spread);

  return `${round(x2)},${round(y2)} ${round(leftX)},${round(leftY)} ${round(rightX)},${round(rightY)}`;
}

/**
 * Angle (in degrees) to rotate a label so it sits along an arrow.
 * The text always reads left to right, whichever way the arrow points.
 */
export function labelAngle(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const radians = dx >= 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx);
  return Math.round(((radians * 180) / Math.PI) * 100) / 100;
}
