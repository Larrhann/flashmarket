import { SubscriptionForm } from "@/components/settings/subscription-form";
import { PRICING } from "@/lib/constants";

export default function ProSubscriptionPage() {
  return (
    <SubscriptionForm
      type="abonnement_pro"
      title="Compte Pro"
      price={PRICING.PRO_MONTHLY}
      benefits={[
        "Publications d'événements et formations en illimité",
        "Badge de certification visible sur ton profil et tes annonces",
        "Mise en avant auprès des habitants de ton quartier",
      ]}
    />
  );
}
