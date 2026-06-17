"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notif {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("admin_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifs(data ?? []));
  }, [userId]);

  const unread = notifs.filter((n) => !n.lu).length;

  async function markRead(id: number) {
    const supabase = createClient();
    await supabase.from("admin_notifications").update({ lu: true }).eq("id", id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  }

  async function markAllRead() {
    const supabase = createClient();
    const ids = notifs.filter((n) => !n.lu).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("admin_notifications").update({ lu: true }).in("id", ids);
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
  }

  if (notifs.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-3xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary">
                  Tout lire
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-muted" />
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`cursor-pointer border-b border-border p-4 last:border-0 ${!n.lu ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{n.titre}</p>
                  {!n.lu && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(n.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
