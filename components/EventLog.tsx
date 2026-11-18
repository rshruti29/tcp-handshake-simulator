"use client";

// A running list of what has happened so far.

import { AnimatePresence, motion } from "framer-motion";
import type { LogEntry } from "@/types/tcp";
import { FLAG_STYLES } from "@/utils/handshake";

interface EventLogProps {
  entries: LogEntry[];
}

export default function EventLog({ entries }: EventLogProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-base font-semibold">Event log</h2>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No events yet. Every packet sent and received will be listed here.
        </p>
      ) : (
        <ol className="mt-4 space-y-2.5" aria-live="polite">
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => (
              <motion.li
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-4 text-right font-mono text-xs text-muted">{index + 1}</span>
                <Marker entry={entry} />
                <span className={entry.kind === "success" ? "font-semibold text-ok" : ""}>
                  {entry.text}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      <p className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted" /> sent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-muted" /> received
        </span>
      </p>
    </section>
  );
}

/** Filled dot = packet sent, hollow dot = packet received, check = connected. */
function Marker({ entry }: { entry: LogEntry }) {
  if (entry.kind === "success" || !entry.flag) {
    return <span className="flex size-2.5 items-center justify-center text-[10px] text-ok">✓</span>;
  }
  const styles = FLAG_STYLES[entry.flag];
  return entry.kind === "send" ? (
    <span className={`size-2.5 shrink-0 rounded-full ${styles.solid}`} />
  ) : (
    <span className={`size-2.5 shrink-0 rounded-full border-2 ${styles.border}`} />
  );
}
