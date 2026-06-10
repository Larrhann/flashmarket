import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedView } from "@/components/feed/feed-view";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("quartier_id, quartiers(nom)")
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
      quartierId={profile.quartier_id}
      quartierNom={quartierNom}
      currentUserId={user.id}
      likedPostIds={(likes ?? []).map((l) => l.post_id)}
    />
  );
}
