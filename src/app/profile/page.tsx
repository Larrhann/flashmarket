import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, quartiers(nom), villes(nom)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/location");

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("statut", "actif");

  return (
    <ProfileView
      profile={profile}
      posts={posts ?? []}
      subscriptions={subscriptions ?? []}
      quartierNom={(profile.quartiers as unknown as { nom: string } | null)?.nom ?? "—"}
      villeNom={(profile.villes as unknown as { nom: string } | null)?.nom ?? "—"}
    />
  );
}
