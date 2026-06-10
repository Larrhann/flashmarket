import { SubscriptionForm } from "@/components/settings/subscription-form";
import { PRICING } from "@/lib/constants";

export default function VipSubscriptionPage() {
  return (
    <SubscriptionForm
      type="abonnement_vip"
      title="Alertes VIP"
      price={PRICING.VIP_MONTHLY}
      benefits={[
        "Reçois par SMS les nouveautés de ton quartier",
        "Sois informé(e) en premier des bons plans Flash Marché",
        "Annulable à tout moment",
      ]}
    />
  );
}
