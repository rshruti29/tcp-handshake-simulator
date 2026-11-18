// Handshake data and small helper functions.
// Keeping the data here means the components only have to display it.

import type {
  HandshakeStep,
  LogEntry,
  Packet,
  PacketPhase,
  TcpFlag,
  TcpState,
} from "@/types/tcp";

/**
 * Initial sequence numbers (ISN).
 * Real computers choose these at random. We use round numbers
 * so the "+1" in each acknowledgement is easy to follow.
 */
export const CLIENT_ISN = 1000;
export const SERVER_ISN = 5000;

/** How long one packet takes to cross the wire, in milliseconds. */
export const TRAVEL_TIME_MS = 2200;

/** Pause between one packet arriving and the next one leaving. */
export const GAP_BETWEEN_STEPS_MS = 900;

/** stepIndex value used before the simulation starts. */
export const NOT_STARTED_INDEX = -1;

/** stepIndex value used once all three packets are done. */
export const ESTABLISHED_INDEX = 3;

/** The three steps of the handshake, in order. */
export const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    stepNumber: 1,
    title: "Client sends SYN",
    packet: {
      id: 1,
      source: "Client",
      destination: "Server",
      sequenceNumber: CLIENT_ISN,
      acknowledgementNumber: null,
      flag: "SYN",
    },
    explanation: `The client asks to open a connection by sending a SYN (synchronize) packet. It also picks its starting sequence number, ${CLIENT_ISN}, so both sides can keep track of the bytes it will send.`,
    sendLog: "Client sends SYN",
    receiveLog: "Server receives SYN",
  },
  {
    stepNumber: 2,
    title: "Server replies SYN+ACK",
    packet: {
      id: 2,
      source: "Server",
      destination: "Client",
      sequenceNumber: SERVER_ISN,
      acknowledgementNumber: CLIENT_ISN + 1,
      flag: "SYN+ACK",
    },
    explanation: `The server agrees by replying with SYN+ACK. Its acknowledgement number, ${CLIENT_ISN + 1}, is the client's number plus one and confirms the SYN arrived. The server also sends its own starting sequence number, ${SERVER_ISN}.`,
    sendLog: "Server sends SYN+ACK",
    receiveLog: "Client receives SYN+ACK",
  },
  {
    stepNumber: 3,
    title: "Client replies ACK",
    packet: {
      id: 3,
      source: "Client",
      destination: "Server",
      sequenceNumber: CLIENT_ISN + 1,
      acknowledgementNumber: SERVER_ISN + 1,
      flag: "ACK",
    },
    explanation: `The client confirms the server's sequence number by sending an ACK with acknowledgement number ${SERVER_ISN + 1}. When the server receives it, both sides know the other is ready.`,
    sendLog: "Client sends ACK",
    receiveLog: "Server receives ACK",
  },
];

/** Learning panel text before the simulation starts. */
export const IDLE_EXPLANATION =
  "TCP opens every connection with three packets before any data is sent. Press Start to watch them travel, or use Next step to move one packet at a time.";

/** Learning panel text once the connection is established. */
export const ESTABLISHED_EXPLANATION =
  "Both computers have agreed on starting sequence numbers and confirmed each other. The connection is now established, so data can flow in both directions.";

/**
 * Builds the event log from the current position in the simulation.
 * Because the log is calculated (not stored), Previous step and Reset
 * always show the correct log without extra work.
 */
export function getEventLog(stepIndex: number, phase: PacketPhase): LogEntry[] {
  const entries: LogEntry[] = [];

  HANDSHAKE_STEPS.forEach((step, index) => {
    if (index > stepIndex) return; // this packet has not been sent yet

    entries.push({
      id: `${step.packet.id}-send`,
      text: step.sendLog,
      kind: "send",
      flag: step.packet.flag,
    });

    // Earlier packets are always delivered; the current one only once it has arrived.
    const delivered = index < stepIndex || phase === "arrived";
    if (delivered) {
      entries.push({
        id: `${step.packet.id}-receive`,
        text: step.receiveLog,
        kind: "receive",
        flag: step.packet.flag,
      });
    }
  });

  if (stepIndex >= ESTABLISHED_INDEX) {
    entries.push({ id: "established", text: "Connection Established", kind: "success" });
  }

  return entries;
}

/** Returns the TCP state of each computer at the current point in the handshake. */
export function getHostStates(
  stepIndex: number,
  phase: PacketPhase
): { client: TcpState; server: TcpState } {
  if (stepIndex < 0) return { client: "CLOSED", server: "LISTEN" };
  if (stepIndex >= ESTABLISHED_INDEX) return { client: "ESTABLISHED", server: "ESTABLISHED" };

  const arrived = phase === "arrived";

  if (stepIndex === 0) {
    // Client has sent SYN; the server moves to SYN_RECEIVED when it gets it.
    return { client: "SYN_SENT", server: arrived ? "SYN_RECEIVED" : "LISTEN" };
  }
  if (stepIndex === 1) {
    // The client becomes ESTABLISHED as soon as it receives SYN+ACK.
    return { client: arrived ? "ESTABLISHED" : "SYN_SENT", server: "SYN_RECEIVED" };
  }
  // Step 3: the server becomes ESTABLISHED when the final ACK arrives.
  return { client: "ESTABLISHED", server: arrived ? "ESTABLISHED" : "SYN_RECEIVED" };
}

/** All packets that have been sent so far (these are the ones you can click). */
export function getPacketsSentSoFar(stepIndex: number): Packet[] {
  return HANDSHAKE_STEPS.filter((_, index) => index <= stepIndex).map((step) => step.packet);
}

/** The 1-bit SYN and ACK flags inside the TCP header for each packet type. */
export function getFlagBits(flag: TcpFlag): { SYN: 0 | 1; ACK: 0 | 1 } {
  return {
    SYN: flag === "ACK" ? 0 : 1,
    ACK: flag === "SYN" ? 0 : 1,
  };
}

/**
 * Tailwind classes for each flag colour.
 * Class names are written out in full so Tailwind can find them.
 */
export const FLAG_STYLES: Record<
  TcpFlag,
  {
    text: string;
    border: string;
    bg: string;
    solid: string;
    ring: string;
    fill: string;
    stroke: string;
  }
> = {
  SYN: {
    text: "text-syn",
    border: "border-syn",
    bg: "bg-syn/10",
    solid: "bg-syn",
    ring: "ring-syn/30",
    fill: "fill-syn",
    stroke: "stroke-syn",
  },
  "SYN+ACK": {
    text: "text-synack",
    border: "border-synack",
    bg: "bg-synack/10",
    solid: "bg-synack",
    ring: "ring-synack/30",
    fill: "fill-synack",
    stroke: "stroke-synack",
  },
  ACK: {
    text: "text-ack",
    border: "border-ack",
    bg: "bg-ack/10",
    solid: "bg-ack",
    ring: "ring-ack/30",
    fill: "fill-ack",
    stroke: "stroke-ack",
  },
};
