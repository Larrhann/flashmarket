import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminContentEditor } from "@/components/admin/admin-content-editor";

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const admin = createAdminClient();
  const { data: entries } = await admin.from("content_settings").select("key, value").order("key");

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Contenu</h1>
        <p className="text-sm text-muted">Tarifs et page &quot;Comment ça marche&quot;</p>
      </div>
      <AdminNav />
      <AdminContentEditor entries={entries ?? []} />
    </main>
  );
}
