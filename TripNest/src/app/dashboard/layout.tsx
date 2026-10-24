import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations, messages, trips } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import Sidebar from "@/components/dashboard/Sidebar";
import { ToastProvider } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [destCount, tripCount, newMsgs] = await Promise.all([
    db.select({ v: count() }).from(destinations).where(eq(destinations.userId, user.id)),
    db.select({ v: count() }).from(trips).where(eq(trips.userId, user.id)),
    db
      .select({ v: count() })
      .from(messages)
      .where(eq(messages.status, "new")),
  ]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-sand-50 lg:flex-row">
        <Sidebar
          user={{ name: user.name, email: user.email, homeCity: user.homeCity }}
          counts={{
            destinations: Number(destCount[0]?.v ?? 0),
            trips: Number(tripCount[0]?.v ?? 0),
            newMessages: Number(newMsgs[0]?.v ?? 0),
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
