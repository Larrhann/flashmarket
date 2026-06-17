import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET ?? "fm-otp-secret-ci-2025";

function signPayload(payload: string) {
  return crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const cookieVal = req.cookies.get("fm_otp")?.value;
  if (!cookieVal) {
    return NextResponse.json({ error: "Session expirée. Recommence l'inscription." }, { status: 400 });
  }

  let parsed: { userId: string; email: string; nom: string; prenom: string; telephone: string; code: string; expires: number; sig: string };
  try {
    parsed = JSON.parse(Buffer.from(cookieVal, "base64").toString());
  } catch {
    return NextResponse.json({ error: "Session invalide." }, { status: 400 });
  }

  const { userId, email, nom, prenom, telephone, code: storedCode, expires, sig } = parsed;

  // Vérifier signature
  const payload = `${userId}:${email}:${nom}:${prenom}:${telephone}:${storedCode}:${expires}`;
  if (signPayload(payload) !== sig) {
    return NextResponse.json({ error: "Session invalide." }, { status: 400 });
  }

  if (Date.now() > expires) {
    return NextResponse.json({ error: "Code expiré. Recommence l'inscription." }, { status: 400 });
  }

  if (code.trim() !== storedCode) {
    return NextResponse.json({ error: "Code incorrect." }, { status: 400 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Confirmer l'email
  const { error: confirmErr } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (confirmErr) {
    return NextResponse.json({ error: confirmErr.message }, { status: 500 });
  }

  // Créer le profil
  await admin.from("profiles").upsert({ id: userId, nom, prenom, telephone });

  // Récupérer le mot de passe via sign-in — on a besoin de le connaître
  // Il est dans la session Supabase du user créé, on ne peut pas le lire.
  // On retourne un flag pour que le client fasse signInWithPassword avec son mot de passe mémorisé côté client.
  const response = NextResponse.json({ success: true, userId });
  response.cookies.delete("fm_otp");
  return response;
}
