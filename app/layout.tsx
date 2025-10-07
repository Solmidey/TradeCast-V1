import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TradeCast by Base",
  description:
    "Turn onchain trades into viral Farcaster casts complete with proofs, mirroring, and price context.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-surface text-white">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-gradient-to-b from-surface via-surface to-black`}
      >
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
