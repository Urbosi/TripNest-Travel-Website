import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TripNest — Plan, budget and relive every trip",
    template: "%s · TripNest",
  },
  description:
    "TripNest is a travel planner for real budgets: discover destinations, build trips, track every dollar spent and keep your itineraries in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand-50 text-ink antialiased">{children}</body>
    </html>
  );
}
