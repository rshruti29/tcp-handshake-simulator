"use client";

// Simulation page: puts all the components together.
// The logic itself lives in hooks/useHandshakeSimulation.ts.

import Link from "next/link";
import { useState } from "react";
import { MotionConfig } from "framer-motion";
import Controls from "@/components/Controls";
import EventLog from "@/components/EventLog";
import InfoPanel from "@/components/InfoPanel";
import NetworkView from "@/components/NetworkView";
import PacketDetails from "@/components/PacketDetails";
import SequenceDiagram from "@/components/SequenceDiagram";
import { useHandshakeSimulation } from "@/hooks/useHandshakeSimulation";
import type { SimulationStatus } from "@/types/tcp";
import { getPacketsSentSoFar } from "@/utils/handshake";

const STATUS_LABELS: Record<SimulationStatus, string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  done: "Connected",
};

export default function SimulationPage() {
  const sim = useHandshakeSimulation();

  // Which packet the user clicked (null = none).
  const [selectedPacketId, setSelectedPacketId] = useState<number | null>(null);

  // Only packets that have actually been sent can be shown.
  const selectedPacket =
    getPacketsSentSoFar(sim.stepIndex).find((packet) => packet.id === selectedPacketId) ?? null;

  function handleReset() {
    sim.controls.reset();
    setSelectedPacketId(null);
  }

  function handleStart() {
    setSelectedPacketId(null);
    sim.controls.start();
  }

  return (
    // reducedMotion="user" turns off decorative animations for people who ask for less motion.
    <MotionConfig reducedMotion="user">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-sm text-muted hover:text-ink">
              ← Home
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              TCP three-way handshake
            </h1>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              sim.status === "done" ? "border-ok text-ok" : "border-line text-muted"
            }`}
            aria-live="polite"
          >
            {STATUS_LABELS[sim.status]}
          </span>
        </header>

        <NetworkView
          stepIndex={sim.stepIndex}
          currentStep={sim.currentStep}
          phase={sim.phase}
          progress={sim.progress}
          hostStates={sim.hostStates}
          isEstablished={sim.isEstablished}
          selectedPacketId={selectedPacketId}
          onSelectPacket={setSelectedPacketId}
        />

        <div className="mt-4">
          <Controls
            status={sim.status}
            isStarted={sim.isStarted}
            onStart={handleStart}
            onPause={sim.controls.pause}
            onResume={sim.controls.resume}
            onReset={handleReset}
            onPrevious={sim.controls.previousStep}
            onNext={sim.controls.nextStep}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoPanel stepIndex={sim.stepIndex} />
            <PacketDetails packet={selectedPacket} onClear={() => setSelectedPacketId(null)} />
          </div>
          <div className="space-y-4">
            <EventLog entries={sim.eventLog} />
            <SequenceDiagram
              stepIndex={sim.stepIndex}
              phase={sim.phase}
              progress={sim.progress}
              selectedPacketId={selectedPacketId}
              onSelectPacket={setSelectedPacketId}
            />
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
