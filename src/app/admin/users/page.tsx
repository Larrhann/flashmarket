import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminUsersList } from "@/components/admin/admin-users-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, nom, prenom, telephone, is_pro, vip_alertes, verification_statut, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">Utilisateurs</h1>
      <AdminNav />
      <AdminUsersList users={users ?? []} />
    </main>
  );
}
