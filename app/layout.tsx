import type { Metadata } from "next";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const metadata: Metadata = {
  title: "Milkup - Markdown + Media Editor",
  description: "POC: Milkdown + Convex + Video Support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100">
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </body>
    </html>
  );
}
