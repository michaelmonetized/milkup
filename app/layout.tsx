import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milkup - Markdown + Media Editor",
  description: "POC: Markdown Editor + Media Picker + Video Support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
