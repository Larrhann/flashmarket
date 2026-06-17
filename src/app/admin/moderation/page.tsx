import { createAdminClient } from "@/lib/supabase/admin";
import { AdminModerationList } from "@/components/admin/admin-moderation-list";

export default async function ModerationPage() {

  const admin = createAdminClient();

  const { data: posts } = await admin
    .from("posts")
    .select("id, titre, type, prix, description, created_at, user_id, quartier_id")
    .or("prix.is.null,prix.eq.0")
    .eq("statut", "actif")
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const quartierIds = [...new Set((posts ?? []).map((p) => p.quartier_id))];

  const [{ data: profilesData }, { data: quartiersData }] = await Promise.all([
    userIds.length ? admin.from("profiles").select("id, nom, prenom").in("id", userIds) : { data: [] },
    quartierIds.length ? admin.from("quartiers").select("id, nom").in("id", quartierIds) : { data: [] },
  ]);

  const profileMap = Object.fromEntries((profilesData ?? []).map((p) => [p.id, `${p.prenom} ${p.nom}`]));
  const quartierMap = Object.fromEntries((quartiersData ?? []).map((q) => [q.id, q.nom]));

  const formatted = (posts ?? []).map((p) => ({
    id: p.id,
    titre: p.titre,
    type: p.type,
    prix: p.prix,
    description: p.description,
    created_at: p.created_at,
    user_id: p.user_id,
    auteur: profileMap[p.user_id] ?? "Inconnu",
    quartier: quartierMap[p.quartier_id] ?? "?",
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Modération</h1>
          <p className="text-sm text-muted">Publications avec prix manquant ou nul</p>
        </div>
        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
          {formatted.length} en attente
        </span>
      </div>
      <AdminModerationList posts={formatted} />
    </div>
  );
}
