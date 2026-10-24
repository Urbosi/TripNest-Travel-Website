import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/dashboard/PageHeader";
import MessagesManager, { type MessageRow } from "@/components/dashboard/MessagesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

export default async function DashboardMessagesPage() {
  await requireUser();
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Inbox"
        description="Every message submitted through the public contact form. Opening a message marks it as read automatically."
      />
      <MessagesManager initial={rows as unknown as MessageRow[]} />
    </>
  );
}
