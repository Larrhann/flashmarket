import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_SECRET = process.env.OTP_SECRET ?? "fm-otp-secret-ci-2025";

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email, nom, prenom, telephone, password } = await req.json();

  if (!email || !nom || !prenom || !telephone || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  // Créer ou récupérer l'utilisateur via admin (non confirmé)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let userId: string;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  });

  if (createErr) {
    if (!createErr.message.toLowerCase().includes("already registered") &&
        !createErr.message.toLowerCase().includes("already been registered")) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }
    // Utilisateur existant → récupérer son ID
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    const existing = list?.users.find((u) => u.email === email);
    if (!existing) return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    userId = existing.id;
    // Mettre à jour le mot de passe
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: false });
  } else {
    userId = created.user!.id;
  }

  const code = makeCode();
  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  const payload = `${userId}:${email}:${nom}:${prenom}:${telephone}:${code}:${expires}`;
  const sig = signPayload(payload);
  const cookie = Buffer.from(JSON.stringify({ userId, email, nom, prenom, telephone, code, expires, sig })).toString("base64");

  // Envoi email via Resend
  const { error: mailErr } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "FlashMarket <onboarding@resend.dev>",
    to: email,
    subject: "Ton code de vérification FlashMarket",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0d9488">Bienvenue sur FlashMarket 🎉</h2>
        <p>Voici ton code de vérification :</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#134e4a;padding:16px 0">${code}</div>
        <p style="color:#666">Ce code expire dans <strong>10 minutes</strong>.</p>
        <p style="color:#999;font-size:12px">Si tu n'as pas demandé ce code, ignore cet email.</p>
      </div>
    `,
  });

  if (mailErr) {
    return NextResponse.json({ error: "Impossible d'envoyer l'email." }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("fm_otp", cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
