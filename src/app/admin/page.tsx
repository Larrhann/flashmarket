import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserRegistrationChart, RevenueChart } from "@/components/admin/admin-charts";
import { Users, FileText, ShieldCheck, TrendingUp, Zap, Crown } from "lucide-react";

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

function last6Months() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: proUsers },
    { count: vipUsers },
    { count: verificationsEnAttente },
    { data: allProfiles },
    { data: allTransactions },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("posts").select("*", { count: "exact", head: true }).eq("statut", "actif"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_pro", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("vip_alertes", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("verification_statut", "en_attente"),
    admin.from("profiles").select("created_at"),
    admin.from("transactions").select("montant, type, statut, created_at").eq("statut", "reussi"),
  ]);

  const months = last6Months();

  // User registration curve
  const usersByMonth: Record<string, number> = {};
  months.forEach((m) => (usersByMonth[m] = 0));
  (allProfiles ?? []).forEach((p) => {
    const k = monthKey(p.created_at);
    if (k in usersByMonth) usersByMonth[k]++;
  });
  const userChartData = months.map((m) => ({ month: monthLabel(m), users: usersByMonth[m] }));

  // Revenue by month and type
  const revenueByMonth: Record<string, { boosts: number; vip: number; pro: number; publications: number }> = {};
  months.forEach((m) => (revenueByMonth[m] = { boosts: 0, vip: 0, pro: 0, publications: 0 }));
  (allTransactions ?? []).forEach((t) => {
    const k = monthKey(t.created_at);
    if (!(k in revenueByMonth)) return;
    if (t.type === "boost") revenueByMonth[k].boosts += t.montant;
    else if (t.type === "abonnement_vip") revenueByMonth[k].vip += t.montant;
    else if (t.type === "abonnement_pro") revenueByMonth[k].pro += t.montant;
    else if (t.type === "publication") revenueByMonth[k].publications += t.montant;
  });
  const revenueChartData = months.map((m) => ({ month: monthLabel(m), ...revenueByMonth[m] }));

  const totalRevenueMois = Object.values(revenueByMonth[months[months.length - 1]]).reduce((a, b) => a + b, 0);
  const totalRevenueTous = (allTransactions ?? []).reduce((sum, t) => sum + t.montant, 0);

  const stats = [
    { label: "Utilisateurs total", value: totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Publications actives", value: totalPosts ?? 0, icon: FileText, color: "text-blue-500" },
    { label: "Abonnés Pro (4 000)", value: proUsers ?? 0, icon: Crown, color: "text-yellow-500" },
    { label: "Abonnés VIP (1 000)", value: vipUsers ?? 0, icon: Zap, color: "text-purple-500" },
    { label: "Vérifications en attente", value: verificationsEnAttente ?? 0, icon: ShieldCheck, color: "text-orange-500" },
    { label: "Revenus ce mois (FCFA)", value: new Intl.NumberFormat("fr-FR").format(totalRevenueMois), icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard Admin</h1>
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
          Revenus totaux : {new Intl.NumberFormat("fr-FR").format(totalRevenueTous)} FCFA
        </span>
      </div>
      <AdminNav />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-4">
            <Icon size={20} className={color} />
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <UserRegistrationChart data={userChartData} />
        <RevenueChart data={revenueChartData} />
      </div>
    </main>
  );
}
