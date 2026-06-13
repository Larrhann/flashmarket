import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromImage, nameMatchesDocument } from "@/lib/ocr";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { rectoPath, versoPath } = await request.json();
  if (!rectoPath || !versoPath) {
    return NextResponse.json({ error: "Photos recto et verso requises" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("nom, prenom")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const [recto, verso] = await Promise.all([
    admin.storage.from("cni-documents").download(rectoPath),
    admin.storage.from("cni-documents").download(versoPath),
  ]);

  if (recto.error || verso.error || !recto.data || !verso.data) {
    return NextResponse.json({ error: "Impossible de lire les photos" }, { status: 400 });
  }

  const [rectoBuffer, versoBuffer] = await Promise.all([
    recto.data.arrayBuffer().then(Buffer.from),
    verso.data.arrayBuffer().then(Buffer.from),
  ]);

  let ocrText = "";
  try {
    const [rectoText, versoText] = await Promise.all([
      extractTextFromImage(rectoBuffer),
      extractTextFromImage(versoBuffer),
    ]);
    ocrText = `${rectoText} ${versoText}`;
  } catch {
    ocrText = "";
  }

  const matches = ocrText.trim().length > 0 && nameMatchesDocument(profile.nom, profile.prenom, ocrText);
  const statut = matches ? "verifie" : "en_attente";

  await admin
    .from("profiles")
    .update({
      cni_photo_url: rectoPath,
      cni_photo_url_verso: versoPath,
      verification_statut: statut,
    })
    .eq("id", user.id);

  return NextResponse.json({ statut });
}
