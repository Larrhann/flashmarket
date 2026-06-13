import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminVerificationList } from "@/components/admin/verification-list";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/");

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

  return <AdminVerificationList items={items} />;
}
