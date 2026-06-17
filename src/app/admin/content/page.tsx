import { createAdminClient } from "@/lib/supabase/admin";
import { AdminContentEditor } from "@/components/admin/admin-content-editor";

export default async function ContentPage() {
  const admin = createAdminClient();
  const { data: entries } = await admin.from("content_settings").select("key, value").order("key");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Contenu</h1>
        <p className="text-sm text-muted">Tarifs et page &quot;Comment ça marche&quot;</p>
      </div>
      <AdminContentEditor entries={entries ?? []} />
    </div>
  );
}
