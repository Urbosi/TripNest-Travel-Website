import type { ReactNode } from "react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { ToastProvider } from "@/components/ui";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const user = await getCurrentUser();

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <SiteNav user={user ? { name: user.name } : null} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ToastProvider>
  );
}
