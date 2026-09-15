import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";

import AuthProvider from "@/components/providers/AuthProvider";

import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-falcon-display",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-falcon-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-falcon-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FALCON — AI-First Fashion Platform",
  description:
    "FALCON is an AI-first fashion platform for intelligent styling, commerce, and personalized fashion experiences.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}