export default function ConfidentialitePage() {
  return (
    <main className="px-4 py-6 md:mx-auto md:max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Politique de confidentialité</h1>

      <div className="space-y-4 text-sm text-foreground">
        <p className="text-muted">Dernière mise à jour : juin 2026</p>

        <section>
          <h2 className="mb-1 font-semibold">1. Données collectées</h2>
          <p>
            Lors de l&apos;inscription, FlashMarket collecte : nom, prénom, numéro de
            téléphone, adresse email, ville et quartier. Lors de la publication d&apos;une
            annonce, nous collectons également : titre, description, prix, photos et
            coordonnées de contact (WhatsApp, numéro d&apos;appel). Si tu demandes la
            certification de ton compte, une copie de ta CNI (recto/verso) est collectée.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">2. Utilisation des données</h2>
          <p>
            Ces données servent à : créer et sécuriser ton compte, afficher tes annonces
            dans ton quartier/ville, te permettre d&apos;être contacté par d&apos;autres
            utilisateurs, traiter les paiements (boost, abonnements), et lutter contre la
            fraude (vérification d&apos;identité).
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">3. Partage des données</h2>
          <p>
            Tes coordonnées de contact (WhatsApp/appel) sont visibles publiquement sur tes
            annonces, car c&apos;est leur but. Les autres données (email, CNI) ne sont
            jamais vendues à des tiers. Elles peuvent être partagées avec nos prestataires
            techniques (hébergement, paiement) uniquement pour le fonctionnement du
            service.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">4. Conservation</h2>
          <p>
            Les données sont conservées tant que ton compte est actif. Tu peux demander la
            suppression de ton compte et de tes données à tout moment via les Réglages ou
            en nous contactant.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">5. Vos droits</h2>
          <p>
            Conformément à la loi ivoirienne n°2013-450 relative à la protection des
            données à caractère personnel, tu disposes d&apos;un droit d&apos;accès, de
            rectification et de suppression de tes données personnelles.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">6. Sécurité</h2>
          <p>
            Les données sont stockées de manière sécurisée (chiffrement en transit via
            HTTPS, accès restreint par compte). Les photos de pièces d&apos;identité ne sont
            accessibles qu&apos;à l&apos;équipe FlashMarket pour la vérification.
          </p>
        </section>
      </div>
    </main>
  );
}
