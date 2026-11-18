"use client";

// Playback buttons. Each button is only enabled when it makes sense.

import type { SimulationStatus } from "@/types/tcp";

interface ControlsProps {
  status: SimulationStatus;
  isStarted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const baseButton =
  "rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-35";
const primaryButton = `${baseButton} bg-ink text-paper hover:opacity-85`;
const secondaryButton = `${baseButton} border border-line bg-surface text-ink hover:border-muted`;

export default function Controls({
  status,
  isStarted,
  onStart,
  onPause,
  onResume,
  onReset,
  onPrevious,
  onNext,
}: ControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Simulation controls"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
    >
      <button
        type="button"
        className={primaryButton}
        onClick={onStart}
        disabled={status !== "idle" && status !== "done"}
      >
        Start
      </button>
      <button type="button" className={primaryButton} onClick={onPause} disabled={status !== "running"}>
        Pause
      </button>
      <button type="button" className={primaryButton} onClick={onResume} disabled={status !== "paused"}>
        Resume
      </button>
      <button type="button" className={secondaryButton} onClick={onReset} disabled={!isStarted}>
        Reset
      </button>
      <button type="button" className={secondaryButton} onClick={onPrevious} disabled={!isStarted}>
        Previous Step
      </button>
      <button type="button" className={secondaryButton} onClick={onNext} disabled={status === "done"}>
        Next Step
      </button>
    </div>
  );
}
