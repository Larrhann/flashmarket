import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { userId, titre, message } = await request.json();
  if (!userId || !titre || !message) {
    return NextResponse.json({ error: "userId, titre et message requis" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.from("admin_notifications").insert({ user_id: userId, titre, message });

  return NextResponse.json({ ok: true });
}
