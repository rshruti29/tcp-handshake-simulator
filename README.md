# TCP Three-Way Handshake Simulator

An interactive simulator that shows how a TCP connection is opened with SYN, SYN+ACK and ACK.
Built for a Data Communication mini project with Next.js (App Router), TypeScript, Tailwind CSS and Framer Motion.

## 1. Folder structure

```
tcp-handshake-simulator/
├── app/
│   ├── layout.tsx              Root layout: fonts, page title, global CSS
│   ├── globals.css             Tailwind import, colour tokens, light and dark mode
│   ├── page.tsx                Home page (title, TCP intro, Start Simulation button)
│   └── simulation/
│       └── page.tsx            Simulation page (puts every component together)
├── components/
│   ├── Computer.tsx            Client or Server box with its TCP state
│   ├── Packet.tsx              The clickable packet that travels on the wire
│   ├── NetworkView.tsx         Client ---- wire ---- Server stage, step tracker, final message
│   ├── Controls.tsx            Start, Pause, Resume, Reset, Previous Step, Next Step
│   ├── EventLog.tsx            List of events (Client sends SYN, Server receives SYN, ...)
│   ├── InfoPanel.tsx           Learning panel: simple explanation for each step
│   ├── PacketDetails.tsx       Header fields of the clicked packet
│   ├── SequenceDiagram.tsx     Textbook timing diagram, drawn live, arrows clickable
│   └── HandshakePreview.tsx    Animated diagram on the home page
├── hooks/
│   └── useHandshakeSimulation.ts   All simulation logic (useState + useEffect only)
├── types/
│   └── tcp.ts                  TypeScript types (Packet, HandshakeStep, TcpFlag, ...)
├── utils/
│   ├── handshake.ts            Step data, sequence numbers, log and state helpers
│   └── diagram.ts              SVG coordinates for the timing diagrams
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .gitignore
```

`next-env.d.ts`, `.next/` and `node_modules/` are created automatically the first time you run the project. You do not write them yourself.

## 2. Requirements

Node.js 20.9 or newer. Check with:

```bash
node -v
```

## 3. Installation and running

From inside the project folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

For a production build:

```bash
npm run build
npm start
```

### Building the same project from scratch (optional)

If you would rather create the project yourself and paste the files in:

```bash
npx create-next-app@latest tcp-handshake-simulator
# Answer the prompts: TypeScript Yes, Tailwind CSS Yes, App Router Yes,
# src/ directory No, import alias @/* (the default)
cd tcp-handshake-simulator
npm install framer-motion
mkdir components hooks types utils app/simulation
```

Then replace or add every file listed in the folder structure above with the versions in this project.

## 4. What each file does and where it goes

| File | Location | Purpose |
|------|----------|---------|
| `layout.tsx` | `app/` | Wraps every page. Loads the IBM Plex fonts and `globals.css`, sets the browser tab title. |
| `globals.css` | `app/` | Imports Tailwind and defines the colours. Light and dark mode switch automatically with your system theme. Each flag has a colour: SYN blue, SYN+ACK amber, ACK green. |
| `page.tsx` | `app/` | Home page at `/`. |
| `page.tsx` | `app/simulation/` | Simulation page at `/simulation`. Holds the "selected packet" state and lays out the components. |
| `useHandshakeSimulation.ts` | `hooks/` | The brain of the app. Tracks the current step, packet position, and play or pause status, and provides the button actions. |
| `tcp.ts` | `types/` | Shared TypeScript types. |
| `handshake.ts` | `utils/` | The three steps with their packets, explanations and log lines. Change `CLIENT_ISN`, `SERVER_ISN` or `TRAVEL_TIME_MS` here. |
| `diagram.ts` | `utils/` | Coordinates and arrowhead maths for the SVG diagrams. |
| `Computer.tsx` | `components/` | One computer with an icon and its TCP state (CLOSED, LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED). |
| `Packet.tsx` | `components/` | The moving packet. Click it to see its fields. |
| `NetworkView.tsx` | `components/` | The main stage with both computers, the wire, the step tracker and the "Connection Established" message. |
| `Controls.tsx` | `components/` | The six buttons. A button is disabled when it cannot be used. |
| `EventLog.tsx` | `components/` | The event list. Filled dot means sent, hollow dot means received. |
| `InfoPanel.tsx` | `components/` | The learning panel with a 2 to 3 sentence explanation per step. |
| `PacketDetails.tsx` | `components/` | Source, Destination, Sequence Number, Acknowledgement Number and TCP Flag of the clicked packet. |
| `SequenceDiagram.tsx` | `components/` | The timing diagram from textbooks. It grows as packets travel. |
| `HandshakePreview.tsx` | `components/` | The diagram on the home page that draws itself once. |

## 5. How the simulation works

The whole simulation is described by five pieces of state in `useHandshakeSimulation.ts`:

| State | Values | Meaning |
|-------|--------|---------|
| `stepIndex` | -1, 0, 1, 2, 3 | Not started, SYN, SYN+ACK, ACK, Established |
| `phase` | `inFlight`, `arrived` | Is the current packet still travelling? |
| `progress` | 0 to 100 | How far along the wire the packet is |
| `status` | `idle`, `running`, `paused`, `done` | Overall status |
| `autoPlay` | true or false | Move to the next step automatically? |

Three `useEffect` hooks drive it:

1. While running, `requestAnimationFrame` increases `progress`. Pause stops this loop, so the packet freezes exactly where it is.
2. When `progress` reaches 100, the packet is marked as arrived.
3. In auto-play mode, after a short gap the next packet is sent.

The event log, TCP states and visible packets are calculated from this state, not stored separately. That is why Previous Step and Reset always show the right log.

### Buttons

- **Start**: plays the whole handshake automatically.
- **Pause / Resume**: freezes and continues, even in the middle of a packet's journey.
- **Next Step**: if a packet is travelling, it finishes it. Otherwise it sends the next packet and stops when it arrives.
- **Previous Step**: goes back to the moment the previous packet was delivered.
- **Reset**: back to the start.

## 6. Sequence numbers used

| Step | Packet | From to | Seq | Ack |
|------|--------|---------|-----|-----|
| 1 | SYN | Client to Server | 1000 | not used |
| 2 | SYN+ACK | Server to Client | 5000 | 1001 |
| 3 | ACK | Client to Server | 1001 | 5001 |

A SYN uses up one sequence number, so each side acknowledges the other's starting number plus one. Real computers pick random starting numbers; this demo uses round ones to keep the maths easy.
