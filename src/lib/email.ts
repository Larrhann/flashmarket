import { createAdminClient } from "@/lib/supabase/admin";

// Envoie un email aux utilisateurs donnés via Resend.
// Désactivé silencieusement si RESEND_API_KEY n'est pas configurée.
export async function sendEmailToUsers(
  userIds: string[],
  subject: string,
  html: string
) {
  if (userIds.length === 0) return;
  if (!process.env.RESEND_API_KEY) return;

  const supabase = createAdminClient();

  const emails: string[] = [];
  for (const userId of userIds) {
    const { data } = await supabase.auth.admin.getUserById(userId);
    if (data?.user?.email) emails.push(data.user.email);
  }

  if (emails.length === 0) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "FlashMarket <notifications@flashmarket.ci>",
      to: emails,
      subject,
      html,
    }),
  });
}
