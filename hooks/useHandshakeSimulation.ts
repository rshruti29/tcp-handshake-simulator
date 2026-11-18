// All the simulation logic lives in this one custom hook.
// It only uses useState and useEffect, so it is easy to follow.
//
// How the simulation is described:
//   stepIndex  -1 = not started, 0/1/2 = SYN, SYN+ACK, ACK, 3 = established
//   phase      "inFlight" while the packet travels, "arrived" once delivered
//   progress   0 to 100, how far the current packet has travelled
//   status     idle, running, paused or done
//   autoPlay   true = keep going to the next step on its own

import { useEffect, useState } from "react";
import type { PacketPhase, SimulationStatus } from "@/types/tcp";
import {
  ESTABLISHED_INDEX,
  GAP_BETWEEN_STEPS_MS,
  HANDSHAKE_STEPS,
  NOT_STARTED_INDEX,
  TRAVEL_TIME_MS,
  getEventLog,
  getHostStates,
} from "@/utils/handshake";

export function useHandshakeSimulation() {
  const [stepIndex, setStepIndex] = useState<number>(NOT_STARTED_INDEX);
  const [phase, setPhase] = useState<PacketPhase>("inFlight");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  // ---------- Small helpers that move the simulation to a new position ----------

  /** Mark the connection as established (the end of the handshake). */
  function finishHandshake() {
    setStepIndex(ESTABLISHED_INDEX);
    setPhase("arrived");
    setProgress(100);
    setStatus("done");
  }

  /** Send the packet for a step: it starts at the source with progress 0. */
  function sendPacket(index: number) {
    if (index >= ESTABLISHED_INDEX) {
      finishHandshake();
      return;
    }
    setStepIndex(index);
    setPhase("inFlight");
    setProgress(0);
    setStatus("running");
  }

  /** Jump straight to the moment a step's packet has been delivered, then pause. */
  function showDelivered(index: number) {
    setStepIndex(index);
    setPhase("arrived");
    setProgress(100);
    setStatus("paused");
  }

  // ---------- Effects: these make things happen over time ----------

  // 1. Move the packet across the wire while the simulation is running.
  //    requestAnimationFrame gives smooth movement, and stopping it is how Pause works.
  useEffect(() => {
    if (status !== "running" || phase !== "inFlight") return;

    let frameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;
      setProgress((prev) => Math.min(100, prev + (elapsed / TRAVEL_TIME_MS) * 100));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId); // runs on pause, reset or step change
  }, [status, phase]);

  // 2. When the packet reaches the other computer, mark it as arrived.
  //    In step-by-step mode (autoPlay off) we pause here.
  useEffect(() => {
    if (phase === "inFlight" && progress >= 100) {
      setPhase("arrived");
      if (!autoPlay) setStatus("paused");
    }
  }, [progress, phase, autoPlay]);

  // 3. In auto-play mode, wait a moment after each arrival and send the next packet.
  useEffect(() => {
    if (status !== "running" || phase !== "arrived" || !autoPlay) return;

    const timer = setTimeout(() => sendPacket(stepIndex + 1), GAP_BETWEEN_STEPS_MS);
    return () => clearTimeout(timer); // cancelled if the user pauses during the gap
  }, [status, phase, autoPlay, stepIndex]);

  // ---------- Button actions ----------

  function start() {
    setAutoPlay(true);
    sendPacket(0);
  }

  function pause() {
    if (status === "running") setStatus("paused");
  }

  function resume() {
    if (status !== "paused") return;
    setAutoPlay(true);
    setStatus("running");
  }

  function reset() {
    setStepIndex(NOT_STARTED_INDEX);
    setPhase("inFlight");
    setProgress(0);
    setStatus("idle");
    setAutoPlay(true);
  }

  /** Next step: finish the packet in flight, or send the next packet and stop when it arrives. */
  function nextStep() {
    if (status === "done") return;
    setAutoPlay(false);

    if (stepIndex === NOT_STARTED_INDEX) {
      sendPacket(0);
    } else if (phase === "inFlight") {
      showDelivered(stepIndex);
    } else {
      sendPacket(stepIndex + 1);
    }
  }

  /** Previous step: go back to the moment the previous packet was delivered. */
  function previousStep() {
    if (stepIndex === NOT_STARTED_INDEX) return;
    setAutoPlay(false);

    if (stepIndex === ESTABLISHED_INDEX) {
      showDelivered(ESTABLISHED_INDEX - 1); // back to "ACK delivered"
    } else if (stepIndex === 0) {
      reset(); // nothing before the first packet
    } else {
      showDelivered(stepIndex - 1);
    }
  }

  // ---------- Values the page needs ----------

  const isStarted = stepIndex !== NOT_STARTED_INDEX;
  const isEstablished = stepIndex >= ESTABLISHED_INDEX;
  const currentStep =
    isStarted && !isEstablished ? HANDSHAKE_STEPS[stepIndex] : null;

  return {
    stepIndex,
    phase,
    progress,
    status,
    isStarted,
    isEstablished,
    currentStep,
    eventLog: getEventLog(stepIndex, phase),
    hostStates: getHostStates(stepIndex, phase),
    controls: { start, pause, resume, reset, nextStep, previousStep },
  };
}
