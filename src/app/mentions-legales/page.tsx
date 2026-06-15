export default function MentionsLegalesPage() {
  return (
    <main className="px-4 py-6 md:mx-auto md:max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Mentions légales</h1>

      <div className="space-y-4 text-sm text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">Édition</h2>
          <p>
            FlashMarket est édité depuis la Côte d&apos;Ivoire. Pour toute question,
            contacte-nous via WhatsApp Business depuis l&apos;application.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Propriété intellectuelle</h2>
          <p>
            Le nom « FlashMarket », le logo et l&apos;interface de l&apos;application sont
            la propriété de leur éditeur. Toute reproduction sans autorisation est
            interdite.
          </p>
          <p className="mt-2">
            Le contenu publié par les utilisateurs (textes, photos d&apos;annonces) reste
            la propriété de son auteur, qui en garantit les droits. En publiant sur
            FlashMarket, l&apos;utilisateur accorde à FlashMarket le droit d&apos;afficher
            ce contenu sur la plateforme (fil d&apos;actualité, mise en avant).
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Signalement de contenu</h2>
          <p>
            Si un contenu publié porte atteinte à tes droits (image, marque, propriété
            intellectuelle) ou enfreint la loi, signale-le via WhatsApp Business avec le
            lien de l&apos;annonce concernée. Le contenu signalé sera examiné et retiré si
            justifié.
          </p>
        </section>
      </div>
    </main>
  );
}
