"use client";

// Shows the header fields of the packet the user clicked.

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Packet } from "@/types/tcp";
import { FLAG_STYLES, getFlagBits } from "@/utils/handshake";

interface PacketDetailsProps {
  packet: Packet | null;
  onClear: () => void;
}

export default function PacketDetails({ packet, onClear }: PacketDetailsProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Packet information</h2>
        {packet && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-2 py-1 text-xs text-muted hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {packet ? (
          <motion.div
            key={packet.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PacketFields packet={packet} />
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted"
          >
            Click a packet on the wire, or an arrow in the timing diagram, to see what is inside it.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

function PacketFields({ packet }: { packet: Packet }) {
  const styles = FLAG_STYLES[packet.flag];
  const bits = getFlagBits(packet.flag);

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Source", value: packet.source },
    { label: "Destination", value: packet.destination },
    {
      label: "Sequence Number",
      value: <span className="font-mono">{packet.sequenceNumber}</span>,
    },
    {
      label: "Acknowledgement Number",
      value:
        packet.acknowledgementNumber === null ? (
          <span className="text-muted">Not used yet</span>
        ) : (
          <span className="font-mono">{packet.acknowledgementNumber}</span>
        ),
    },
  ];

  return (
    <dl className={`mt-4 overflow-hidden rounded-xl border ${styles.border} ${styles.bg}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 border-b border-line/70 px-4 py-2.5 text-sm"
        >
          <dt className="text-muted">{row.label}</dt>
          <dd className="text-right font-medium">{row.value}</dd>
        </div>
      ))}

      <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
        <dt className="text-muted">TCP Flag</dt>
        <dd className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${styles.border} ${styles.text}`}>
            {packet.flag}
          </span>
          {/* The two flag bits as they appear in the header */}
          <span className="font-mono text-xs text-muted">
            SYN={bits.SYN} ACK={bits.ACK}
          </span>
        </dd>
      </div>
    </dl>
  );
}
