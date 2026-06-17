import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPostsList } from "@/components/admin/admin-posts-list";

export default async function AdminPostsPage() {

  const admin = createAdminClient();

  const { data: posts } = await admin
    .from("posts")
    .select("id, titre, type, prix, statut, created_at, user_id, quartier_id")
    .neq("statut", "supprime")
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const quartierIds = [...new Set((posts ?? []).map((p) => p.quartier_id).filter(Boolean))];

  const [{ data: profiles }, { data: quartiers }] = await Promise.all([
    userIds.length ? admin.from("profiles").select("id, nom, prenom").in("id", userIds) : { data: [] },
    quartierIds.length ? admin.from("quartiers").select("id, nom").in("id", quartierIds) : { data: [] },
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const quartierMap = Object.fromEntries((quartiers ?? []).map((q) => [q.id, q]));

  const formatted = (posts ?? []).map((p) => {
    const prof = profileMap[p.user_id];
    return {
      id: p.id,
      titre: p.titre,
      type: p.type,
      prix: p.prix,
      statut: p.statut,
      created_at: p.created_at,
      user_id: p.user_id,
      auteur: prof ? `${prof.prenom} ${prof.nom}` : "Inconnu",
      quartier: quartierMap[p.quartier_id]?.nom ?? "",
    };
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Publications</h1>
      <AdminPostsList posts={formatted} />
    </div>
  );
}
