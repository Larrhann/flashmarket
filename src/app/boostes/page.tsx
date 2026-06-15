import { createClient } from "@/lib/supabase/server";
import { BoostesView } from "@/components/feed/boostes-view";

export default async function BoostesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, quartiers(nom)")
    .eq("statut", "actif")
    .eq("is_boosted", true)
    .gt("boost_expire_at", new Date().toISOString())
    .order("boost_expire_at", { ascending: false });

  let likedPostIds: number[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedPostIds = (likes ?? []).map((l) => l.post_id);
  }

  const boostedPosts = (posts ?? []).map((p) => ({
    ...p,
    quartier_nom: (p.quartiers as unknown as { nom: string } | null)?.nom,
  }));

  return (
    <BoostesView
      posts={boostedPosts}
      currentUserId={user?.id ?? null}
      likedPostIds={likedPostIds}
    />
  );
}
