import { NextRequest, NextResponse } from "next/server";
import { checkCinetPayTransaction } from "@/lib/cinetpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekKey } from "@/lib/constants";
import { notifyVipForPost } from "@/lib/notify-vip";

// CinetPay envoie une notification (form-urlencoded ou JSON) contenant cpm_trans_id.
export async function POST(request: NextRequest) {
  let transactionId: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    transactionId = body.cpm_trans_id ?? body.transaction_id ?? null;
  } else {
    const form = await request.formData();
    transactionId =
      (form.get("cpm_trans_id") as string) ?? (form.get("transaction_id") as string) ?? null;
  }

  if (!transactionId) {
    return NextResponse.json({ error: "transaction_id manquant" }, { status: 400 });
  }

  const check = await checkCinetPayTransaction(transactionId);
  if (check.data?.status !== "ACCEPTED") {
    return NextResponse.json({ ok: true, status: check.data?.status ?? "UNKNOWN" });
  }

  const supabase = createAdminClient();

  const { data: tx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", Number(transactionId))
    .maybeSingle();

  if (!tx || tx.statut === "reussi") {
    return NextResponse.json({ ok: true });
  }

  await supabase
    .from("transactions")
    .update({ statut: "reussi", provider_ref: transactionId })
    .eq("id", tx.id);

  const payload = (tx.payload ?? {}) as Record<string, unknown>;

  switch (tx.type) {
    case "publication": {
      const { data: post } = await supabase
        .from("posts")
        .insert({
          user_id: tx.user_id,
          type: payload.type as "flash" | "event" | "formation",
          categorie: (payload.categorie as string) ?? null,
          titre: payload.titre as string,
          description: (payload.description as string) ?? null,
          prix: (payload.prix as number) ?? null,
          photos: (payload.photos as string[]) ?? [],
          quartier_id: payload.quartier_id as number,
          ville_id: payload.ville_id as number,
          whatsapp_numero: (payload.whatsapp_numero as string) ?? null,
          appel_numero: (payload.appel_numero as string) ?? null,
          expires_at: (payload.expires_at as string) ?? undefined,
        })
        .select()
        .single();

      if (post) {
        await supabase.from("transactions").update({ post_id: post.id }).eq("id", tx.id);
        await notifyVipForPost(post.id);

        if (post.type === "flash") {
          const semaine = getCurrentWeekKey();
          const { data: quota } = await supabase
            .from("publication_quota")
            .select("nb_publies")
            .eq("user_id", tx.user_id)
            .eq("semaine", semaine)
            .maybeSingle();

          await supabase.from("publication_quota").upsert(
            { user_id: tx.user_id, semaine, nb_publies: (quota?.nb_publies ?? 0) + 1 },
            { onConflict: "user_id,semaine" }
          );
        }
      }
      break;
    }

    case "boost": {
      const postId = payload.post_id as number;
      const hours = payload.duration_hours as number;
      const expireAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      await supabase
        .from("posts")
        .update({ is_boosted: true, boost_expire_at: expireAt })
        .eq("id", postId);

      await supabase.from("transactions").update({ post_id: postId }).eq("id", tx.id);
      break;
    }

    case "abonnement_pro": {
      const dateFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from("subscriptions").insert({
        user_id: tx.user_id,
        type: "pro",
        date_fin: dateFin,
      });

      await supabase
        .from("profiles")
        .update({ is_pro: true, pro_expire_at: dateFin })
        .eq("id", tx.user_id);
      break;
    }

    case "abonnement_vip": {
      const dateFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from("subscriptions").insert({
        user_id: tx.user_id,
        type: "vip_alertes",
        date_fin: dateFin,
      });

      await supabase
        .from("profiles")
        .update({ vip_alertes: true, vip_expire_at: dateFin })
        .eq("id", tx.user_id);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
