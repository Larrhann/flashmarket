import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "./notification-bell";

export async function HeaderNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return <NotificationBell userId={user.id} />;
}
