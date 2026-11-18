"use client";

// The packet that travels along the wire. Clicking it shows its header fields.

import { motion } from "framer-motion";
import type { Packet as PacketType } from "@/types/tcp";
import { FLAG_STYLES } from "@/utils/handshake";

interface PacketProps {
  packet: PacketType;
  /** Horizontal position on the wire: 0 = Client end, 100 = Server end. */
  position: number;
  isSelected: boolean;
  onSelect: (packetId: number) => void;
}

export default function Packet({ packet, position, isSelected, onSelect }: PacketProps) {
  const styles = FLAG_STYLES[packet.flag];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(packet.id)}
      // A small "pop" when a new packet appears.
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      // left moves the packet; x shifts it back by its own width so it never leaves the wire.
      style={{ left: `${position}%`, x: `-${position}%`, y: "-50%" }}
      className={`absolute top-1/2 z-10 cursor-pointer whitespace-nowrap rounded-lg border-2 bg-surface px-2 py-1 font-mono text-[11px] font-semibold shadow-sm sm:px-3 sm:text-xs ${styles.border} ${styles.text} ${
        isSelected ? `ring-4 ${styles.ring}` : ""
      }`}
      aria-label={`${packet.flag} packet from ${packet.source} to ${packet.destination}. Show details`}
      aria-pressed={isSelected}
    >
      {packet.flag}
    </motion.button>
  );
}
