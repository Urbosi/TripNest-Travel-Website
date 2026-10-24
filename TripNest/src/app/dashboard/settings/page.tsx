import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/dashboard/PageHeader";
import SettingsForm from "@/components/dashboard/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Update your profile, traveller type and the default currency used across budgets and expenses."
      />
      <SettingsForm
        profile={{
          name: user.name,
          email: user.email,
          role: user.role,
          homeCity: user.homeCity,
          bio: user.bio,
          currency: user.currency,
        }}
      />
    </>
  );
}
