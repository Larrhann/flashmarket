import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMarketing } from "@/components/admin/admin-marketing";

export default async function MarketingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const admin = createAdminClient();
  const [{ count: vipCount }, { count: proCount }] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("vip_alertes", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_pro", true),
  ]);

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Marketing</h1>
        <p className="text-sm text-muted">Envoyer des messages à vos abonnés</p>
      </div>
      <AdminNav />
      <AdminMarketing vipCount={vipCount ?? 0} proCount={proCount ?? 0} />
    </main>
  );
}
