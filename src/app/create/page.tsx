import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateForm } from "@/components/create/create-form";
import { getCurrentWeekKey } from "@/lib/constants";

export default async function CreatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("quartier_id, ville_id, telephone, is_pro, pro_expire_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.quartier_id || !profile.ville_id) redirect("/onboarding/location");

  const semaine = getCurrentWeekKey();
  const { data: quota } = await supabase
    .from("publication_quota")
    .select("nb_publies")
    .eq("user_id", user.id)
    .eq("semaine", semaine)
    .maybeSingle();

  const isProActive =
    profile.is_pro && (!profile.pro_expire_at || new Date(profile.pro_expire_at) > new Date());

  return (
    <CreateForm
      quartierId={profile.quartier_id}
      villeId={profile.ville_id}
      defaultPhone={profile.telephone}
      isPro={isProActive}
      flashPubliesCetteSemaine={quota?.nb_publies ?? 0}
      semaine={semaine}
    />
  );
}
