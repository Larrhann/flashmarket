import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:contact@flashmarket.ci",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

// Envoie une notification push à tous les abonnements d'une liste d'utilisateurs.
// Supprime automatiquement les abonnements expirés/invalides (410/404).
export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string }
) {
  if (userIds.length === 0) return;
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;

  ensureConfigured();
  const supabase = createAdminClient();

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) return;

  const json = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
