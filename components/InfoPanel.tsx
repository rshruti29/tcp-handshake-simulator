"use client";

// Learning panel: a short, simple explanation of the current step.

import { AnimatePresence, motion } from "framer-motion";
import {
  CLIENT_ISN,
  ESTABLISHED_EXPLANATION,
  ESTABLISHED_INDEX,
  HANDSHAKE_STEPS,
  IDLE_EXPLANATION,
  SERVER_ISN,
} from "@/utils/handshake";

interface InfoPanelProps {
  stepIndex: number;
}

export default function InfoPanel({ stepIndex }: InfoPanelProps) {
  // Pick the heading and text for where we are in the handshake.
  let heading = "How the handshake works";
  let text = IDLE_EXPLANATION;

  if (stepIndex >= ESTABLISHED_INDEX) {
    heading = "Connection established";
    text = ESTABLISHED_EXPLANATION;
  } else if (stepIndex >= 0) {
    const step = HANDSHAKE_STEPS[stepIndex];
    heading = `Step ${step.stepNumber} of 3: ${step.title}`;
    text = step.explanation;
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-muted">Learning panel</h2>

      {/* Fade between explanations when the step changes */}
      <div aria-live="polite" className="min-h-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mt-2 text-lg font-semibold">{heading}</h3>
            <p className="mt-2 max-w-prose leading-relaxed">{text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        Real computers choose random starting sequence numbers. This demo uses {CLIENT_ISN} and{" "}
        {SERVER_ISN} so the plus-one rule is easy to see.
      </p>
    </section>
  );
}
