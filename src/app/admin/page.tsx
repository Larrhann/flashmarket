import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { Users, FileText, ShieldCheck, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: postsAujourdhui },
    { count: verificationsEnAttente },
    { data: revenueData },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("posts").select("*", { count: "exact", head: true }).eq("statut", "actif"),
    admin.from("posts").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    admin.from("profiles").select("*", { count: "exact", head: true })
      .eq("verification_statut", "en_attente"),
    admin.from("transactions").select("montant").eq("statut", "reussi"),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((sum, t) => sum + t.montant, 0);

  const stats = [
    { label: "Utilisateurs", value: totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Publications actives", value: totalPosts ?? 0, icon: FileText, color: "text-accent" },
    { label: "Publiés aujourd'hui", value: postsAujourdhui ?? 0, icon: TrendingUp, color: "text-green-500" },
    { label: "Vérifications en attente", value: verificationsEnAttente ?? 0, icon: ShieldCheck, color: "text-yellow-500" },
  ];

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">Administration</h1>
      <AdminNav />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-4">
            <Icon size={20} className={color} />
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <p className="text-xs text-muted">Revenus totaux</p>
        <p className="text-2xl font-bold text-accent">
          {new Intl.NumberFormat("fr-FR").format(totalRevenue)} FCFA
        </p>
      </div>
    </main>
  );
}
