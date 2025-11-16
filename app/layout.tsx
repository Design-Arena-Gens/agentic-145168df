import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayflow - Minimal Daily Dashboard",
  description: "A minimalistic dashboard to plan focus, tasks, schedule, and rituals for the day."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
