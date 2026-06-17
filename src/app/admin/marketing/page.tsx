import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMarketing } from "@/components/admin/admin-marketing";

export default async function MarketingPage() {
  const admin = createAdminClient();
  const [{ count: vipCount }, { count: proCount }] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("vip_alertes", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_pro", true),
  ]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Marketing</h1>
        <p className="text-sm text-muted">Envoyer des messages à vos abonnés</p>
      </div>
      <AdminMarketing vipCount={vipCount ?? 0} proCount={proCount ?? 0} />
    </div>
  );
}
