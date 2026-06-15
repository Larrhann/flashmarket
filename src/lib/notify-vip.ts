import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUsers } from "@/lib/push";
import { sendEmailToUsers } from "@/lib/email";

const typeLabels: Record<string, string> = {
  flash: "Flash Marché",
  event: "Événement",
  formation: "Formation",
};

// Notifie les abonnés VIP du quartier (hors auteur) lors d'une nouvelle publication.
export async function notifyVipForPost(postId: number) {
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id, type, titre, quartier_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const { data: vipProfiles } = await supabase
    .from("profiles")
    .select("id, notif_push")
    .eq("quartier_id", post.quartier_id)
    .eq("vip_alertes", true)
    .gt("vip_expire_at", new Date().toISOString())
    .neq("id", post.user_id);

  if (!vipProfiles || vipProfiles.length === 0) return;

  const label = typeLabels[post.type] ?? "Publication";
  const title = `Nouveau ${label} dans ton quartier`;
  const body = post.titre;
  const url = `/?post=${post.id}`;

  const pushUserIds = vipProfiles.filter((p) => p.notif_push).map((p) => p.id);
  const allUserIds = vipProfiles.map((p) => p.id);

  await Promise.all([
    sendPushToUsers(pushUserIds, { title, body, url }),
    sendEmailToUsers(
      allUserIds,
      title,
      `<p><strong>${body}</strong></p><p>Découvre cette publication sur FlashMarket.</p>`
    ),
  ]);
}
