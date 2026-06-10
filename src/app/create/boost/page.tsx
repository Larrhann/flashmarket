import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoostForm } from "@/components/create/boost-form";

export default async function BoostPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { post: postId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");
  if (!postId) redirect("/profile");

  const { data: post } = await supabase
    .from("posts")
    .select("id, titre, user_id, is_boosted")
    .eq("id", Number(postId))
    .maybeSingle();

  if (!post || post.user_id !== user.id) redirect("/profile");

  return <BoostForm postId={post.id} titre={post.titre} alreadyBoosted={post.is_boosted} />;
}
