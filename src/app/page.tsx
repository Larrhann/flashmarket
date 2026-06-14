import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedView } from "@/components/feed/feed-view";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: villes } = await supabase.from("villes").select("*").order("nom");
  const { data: quartiers } = await supabase.from("quartiers").select("*").order("nom");

  if (!user) {
    const { data: posts } = await supabase
      .from("posts")
      .select("*, quartiers(nom)")
      .eq("statut", "actif")
      .order("created_at", { ascending: false })
      .limit(100);

    const publicPosts = (posts ?? []).map((p) => ({
      ...p,
      quartier_nom: (p.quartiers as unknown as { nom: string } | null)?.nom,
    }));

    return (
      <FeedView
        initialPosts={publicPosts}
        villes={villes ?? []}
        quartiers={quartiers ?? []}
        currentUserId={null}
        likedPostIds={[]}
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, quartier_id, is_pro, quartiers(nom)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.quartier_id) redirect("/onboarding/location");

  const [{ data: posts }, { data: likes }] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("quartier_id", profile.quartier_id)
      .eq("statut", "actif")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("likes").select("post_id").eq("user_id", user.id),
  ]);

  const quartierNom =
    (profile.quartiers as unknown as { nom: string } | null)?.nom ?? "Mon quartier";

  return (
    <FeedView
      initialPosts={posts ?? []}
      villes={villes ?? []}
      quartiers={quartiers ?? []}
      quartierId={profile.quartier_id}
      quartierNom={quartierNom}
      prenom={profile.prenom}
      isPro={profile.is_pro}
      currentUserId={user.id}
      likedPostIds={(likes ?? []).map((l) => l.post_id)}
    />
  );
}
