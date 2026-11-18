// Shared TypeScript types for the simulator.

/** The two computers taking part in the handshake. */
export type Host = "Client" | "Server";

/** The TCP flags used during the three-way handshake. */
export type TcpFlag = "SYN" | "SYN+ACK" | "ACK";

/** Connection states a TCP host moves through while connecting. */
export type TcpState =
  | "CLOSED"
  | "LISTEN"
  | "SYN_SENT"
  | "SYN_RECEIVED"
  | "ESTABLISHED";

/** The few TCP header fields we show when a packet is clicked. */
export interface Packet {
  id: number; // 1, 2 or 3 (one per handshake step)
  source: Host;
  destination: Host;
  sequenceNumber: number;
  acknowledgementNumber: number | null; // null = ACK field not used yet
  flag: TcpFlag;
}

/** Everything the app needs to know about one handshake step. */
export interface HandshakeStep {
  stepNumber: number; // 1, 2 or 3
  title: string;
  packet: Packet;
  explanation: string; // shown in the learning panel
  sendLog: string; // event log line when the packet leaves
  receiveLog: string; // event log line when the packet arrives
}

/** Overall state of the simulation. */
export type SimulationStatus = "idle" | "running" | "paused" | "done";

/** Where the current packet is: still travelling, or delivered. */
export type PacketPhase = "inFlight" | "arrived";

/** One line in the event log. */
export interface LogEntry {
  id: string;
  text: string;
  kind: "send" | "receive" | "success";
  flag?: TcpFlag;
}
