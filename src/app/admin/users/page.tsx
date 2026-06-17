import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersList } from "@/components/admin/admin-users-list";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, nom, prenom, telephone, is_pro, vip_alertes, verification_statut, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Utilisateurs</h1>
      <AdminUsersList users={users ?? []} />
    </div>
  );
}
