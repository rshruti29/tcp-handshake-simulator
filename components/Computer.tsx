"use client";

// One computer (Client or Server) with its current TCP state.

import { motion } from "framer-motion";
import type { Host, TcpFlag, TcpState } from "@/types/tcp";
import { FLAG_STYLES } from "@/utils/handshake";

interface ComputerProps {
  name: Host;
  tcpState: TcpState;
  /** Flag of the packet this computer is sending or receiving right now, if any. */
  highlightFlag: TcpFlag | null;
}

export default function Computer({ name, tcpState, highlightFlag }: ComputerProps) {
  const isEstablished = tcpState === "ESTABLISHED";
  const borderClass = highlightFlag ? FLAG_STYLES[highlightFlag].border : "border-line";

  return (
    // The column is as wide as the icon; the text below may overflow it slightly, centred.
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-24">
      <motion.div
        animate={{ scale: highlightFlag ? 1.06 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex size-14 items-center justify-center rounded-2xl border-2 bg-surface text-ink transition-colors duration-300 sm:size-20 ${borderClass}`}
      >
        {name === "Client" ? <ClientIcon /> : <ServerIcon />}
      </motion.div>

      <p className="mt-1 whitespace-nowrap text-sm font-semibold">{name}</p>

      <span
        className={`whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors sm:text-[11px] ${
          isEstablished ? "bg-ok/15 text-ok" : "bg-line/60 text-muted"
        }`}
        title="TCP connection state"
      >
        {tcpState}
      </span>
    </div>
  );
}

/** A simple desktop monitor drawn with SVG. */
function ClientIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 sm:size-9" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8 20h8" />
    </svg>
  );
}

/** A simple two-unit server rack drawn with SVG. */
function ServerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 sm:size-9" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="7.5" rx="1.5" />
      <rect x="4" y="13.5" width="16" height="7.5" rx="1.5" />
      <path d="M8 6.75h.01M8 17.25h.01M12 6.75h4M12 17.25h4" />
    </svg>
  );
}
