import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multi-Agent Code Review & Debugging Network",
  description: "Automated tri-agent system for repo analysis"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Multi-Agent Code Review & Debugging Network</h1>
            <nav className="space-x-4 text-sm">
              <a className="hover:underline" href="/">Analyzer</a>
              <a className="hover:underline" href="/paper">Paper</a>
              <a className="hover:underline" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
