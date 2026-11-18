"use client";

// The main stage: Client ---- wire ---- Server, plus a small step tracker.

import { AnimatePresence, motion } from "framer-motion";
import type { HandshakeStep, Host, PacketPhase, TcpFlag, TcpState } from "@/types/tcp";
import { FLAG_STYLES, HANDSHAKE_STEPS } from "@/utils/handshake";
import Computer from "./Computer";
import Packet from "./Packet";

interface NetworkViewProps {
  stepIndex: number;
  currentStep: HandshakeStep | null;
  phase: PacketPhase;
  progress: number;
  hostStates: { client: TcpState; server: TcpState };
  isEstablished: boolean;
  selectedPacketId: number | null;
  onSelectPacket: (packetId: number) => void;
}

export default function NetworkView({
  stepIndex,
  currentStep,
  phase,
  progress,
  hostStates,
  isEstablished,
  selectedPacketId,
  onSelectPacket,
}: NetworkViewProps) {
  const packet = currentStep?.packet ?? null;
  const travelsRight = packet?.source === "Client";

  // Position on the wire measured from the Client side (0) to the Server side (100).
  const position = travelsRight ? progress : 100 - progress;

  /** A computer glows in the packet's colour while sending or receiving it. */
  function highlightFor(host: Host): TcpFlag | null {
    if (!packet) return null;
    if (phase === "inFlight" && packet.source === host) return packet.flag;
    if (phase === "arrived" && packet.destination === host) return packet.flag;
    return null;
  }

  /** One short line under the wire describing what is happening. */
  function caption(): string {
    if (isEstablished) return "Handshake complete";
    if (!packet) return "Waiting to start";
    if (phase === "inFlight") return `${packet.flag} travelling to ${packet.destination}`;
    return `${packet.flag} delivered to ${packet.destination}`;
  }

  return (
    <section
      aria-label="Network view"
      className="rounded-3xl border border-line bg-surface p-4 sm:p-8"
    >
      {/* Client ---- wire ---- Server */}
      <div className="flex items-start gap-3 sm:gap-6">
        <Computer name="Client" tcpState={hostStates.client} highlightFlag={highlightFor("Client")} />

        <div className="relative h-14 flex-1 sm:h-20">
          {/* The cable */}
          <div
            className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full transition-colors duration-500 ${
              isEstablished ? "bg-ok" : "bg-line"
            }`}
          />

          {/* The part of the cable the packet has already covered */}
          {packet && (
            <div
              className={`absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full ${FLAG_STYLES[packet.flag].solid}`}
              style={travelsRight ? { left: 0, width: `${progress}%` } : { right: 0, width: `${progress}%` }}
            />
          )}

          {/* The moving packet (key makes each new packet a fresh element) */}
          {packet && (
            <Packet
              key={packet.id}
              packet={packet}
              position={position}
              isSelected={selectedPacketId === packet.id}
              onSelect={onSelectPacket}
            />
          )}

          {/* Once established, a badge replaces the packet */}
          <AnimatePresence>
            {isEstablished && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap rounded-full border-2 border-ok bg-surface px-3 py-1 text-xs font-semibold text-ok"
                >
                  Connected
                </motion.span>
              </div>
            )}
          </AnimatePresence>

          <p className="absolute inset-x-0 top-full mt-1 text-center text-xs text-muted" aria-live="polite">
            {caption()}
          </p>
        </div>

        <Computer name="Server" tcpState={hostStates.server} highlightFlag={highlightFor("Server")} />
      </div>

      {/* Step tracker: 1 SYN, 2 SYN+ACK, 3 ACK, then Established */}
      <ol className="mt-8 grid grid-cols-4 gap-2 border-t border-line pt-5 sm:gap-4">
        {HANDSHAKE_STEPS.map((step, index) => {
          const delivered = index < stepIndex || (index === stepIndex && phase === "arrived");
          const active = index === stepIndex && phase === "inFlight";
          const styles = FLAG_STYLES[step.packet.flag];
          return (
            <li key={step.stepNumber} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  delivered
                    ? `${styles.border} ${styles.solid} text-surface`
                    : active
                      ? `${styles.border} ${styles.text}`
                      : "border-line text-muted"
                }`}
              >
                {step.stepNumber}
              </span>
              <span className={`font-mono text-[11px] sm:text-xs ${delivered || active ? styles.text : "text-muted"}`}>
                {step.packet.flag}
              </span>
            </li>
          );
        })}
        <li className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
              isEstablished ? "border-ok bg-ok text-surface" : "border-line text-muted"
            }`}
          >
            ✓
          </span>
          <span className={`text-[11px] sm:text-xs ${isEstablished ? "font-semibold text-ok" : "text-muted"}`}>
            Connected
          </span>
        </li>
      </ol>

      {/* Final message */}
      <AnimatePresence>
        {isEstablished && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-center"
            role="status"
          >
            <p className="text-lg font-semibold text-ok sm:text-xl">✅ Connection Established</p>
            <p className="mt-1 text-sm text-muted">Client and Server are both in the ESTABLISHED state.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
