import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initCinetPayPayment } from "@/lib/cinetpay";

const TYPE_LABELS: Record<string, string> = {
  publication: "Publication FlashMarket",
  boost: "Boost annonce FlashMarket",
  abonnement_pro: "Abonnement Pro FlashMarket",
  abonnement_vip: "Abonnement Alertes VIP FlashMarket",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { transactionId } = await request.json();
  if (!transactionId) {
    return NextResponse.json({ error: "transactionId requis" }, { status: 400 });
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !tx) {
    return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, prenom, telephone")
    .eq("id", user.id)
    .maybeSingle();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const result = await initCinetPayPayment({
      transactionId: String(tx.id),
      amount: tx.montant,
      description: TYPE_LABELS[tx.type] ?? "Paiement FlashMarket",
      returnUrl: `${appUrl}/create/payer?tx=${tx.id}`,
      notifyUrl: `${appUrl}/api/payments/webhook`,
      customerName: profile?.prenom,
      customerSurname: profile?.nom,
      customerPhone: profile?.telephone,
    });

    if (result.code !== "201" || !result.data) {
      return NextResponse.json(
        { error: result.message ?? "Erreur d'initialisation du paiement" },
        { status: 502 }
      );
    }

    return NextResponse.json({ paymentUrl: result.data.payment_url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur paiement" },
      { status: 500 }
    );
  }
}
