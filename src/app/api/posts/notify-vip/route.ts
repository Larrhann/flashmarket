import { NextRequest, NextResponse } from "next/server";
import { notifyVipForPost } from "@/lib/notify-vip";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const postId = body.postId as number | undefined;

  if (!postId) {
    return NextResponse.json({ error: "postId manquant" }, { status: 400 });
  }

  await notifyVipForPost(postId);

  return NextResponse.json({ ok: true });
}
