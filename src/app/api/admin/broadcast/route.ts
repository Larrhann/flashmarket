import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { type, target, titre, message } = await req.json();
  const admin = createAdminClient();

  // Fetch target users
  let query = admin.from("profiles").select("id");
  if (target === "vip") query = query.eq("vip_alertes", true);
  else if (target === "pro") query = query.eq("is_pro", true);
  else query = query.or("vip_alertes.eq.true,is_pro.eq.true");

  const { data: targets } = await query;
  if (!targets || targets.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  if (type === "message") {
    const notifications = targets.map((t) => ({
      user_id: t.id,
      titre,
      message,
    }));
    await admin.from("admin_notifications").insert(notifications);
  }
  // SMS type: would call SMS provider — placeholder for now
  // (CinetPay SMS or Orange CI SMS API — requires RCCM)

  return NextResponse.json({ ok: true, sent: targets.length });
}
