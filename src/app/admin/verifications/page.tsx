import { createAdminClient } from "@/lib/supabase/admin";
import { AdminVerificationList } from "@/components/admin/verification-list";

export default async function AdminVerificationsPage() {
  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("profiles")
    .select("id, nom, prenom, telephone, cni_photo_url, cni_photo_url_verso")
    .eq("verification_statut", "en_attente")
    .not("cni_photo_url", "is", null);

  const items = await Promise.all(
    (pending ?? []).map(async (p) => {
      const [recto, verso] = await Promise.all([
        p.cni_photo_url
          ? admin.storage.from("cni-documents").createSignedUrl(p.cni_photo_url, 3600)
          : null,
        p.cni_photo_url_verso
          ? admin.storage.from("cni-documents").createSignedUrl(p.cni_photo_url_verso, 3600)
          : null,
      ]);
      return {
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        rectoUrl: recto?.data?.signedUrl ?? null,
        versoUrl: verso?.data?.signedUrl ?? null,
      };
    })
  );

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Vérifications CNI</h1>
      <AdminVerificationList items={items} />
    </div>
  );
}
