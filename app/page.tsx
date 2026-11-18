// Home page: title, a short introduction to TCP, and the Start Simulation button.

import Link from "next/link";
import HandshakePreview from "@/components/HandshakePreview";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 sm:px-8 lg:py-16">
      <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            TCP Three-Way Handshake Simulator
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Before two computers exchange data over TCP, they agree to talk. They do it with three
            packets: SYN, SYN+ACK and ACK. Watch each one travel, pause at any moment, and click a
            packet to read the numbers inside it.
          </p>
          <Link
            href="/simulation"
            className="mt-8 inline-flex items-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-paper transition hover:opacity-85"
          >
            Start Simulation
          </Link>
        </div>

        <HandshakePreview />
      </div>

      <section className="mt-16 grid gap-6 border-t border-line pt-10 md:grid-cols-[1fr_2fr] md:gap-12">
        <h2 className="text-xl font-semibold">What is TCP?</h2>
        <div className="max-w-prose space-y-4 leading-relaxed text-muted">
          <p>
            TCP (Transmission Control Protocol) is a transport layer protocol used by web pages,
            email and file transfers. It is connection-oriented and reliable: data arrives in order,
            and anything lost on the way is sent again.
          </p>
          <p>
            Every TCP connection starts with the three-way handshake. The client and server each
            choose a starting sequence number and confirm the other&apos;s number by adding one to it.
            Only after that can real data be sent.
          </p>
        </div>
      </section>

      <footer className="mt-12 text-sm text-muted">
        Data Communication mini project. Built with Next.js, Tailwind CSS and Framer Motion.
      </footer>
    </main>
  );
}
