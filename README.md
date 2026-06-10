# FlashMarket

App PWA hyperlocale : fil chronologique d'annonces (Flash Marché), d'événements
et de formations, filtré par ville/quartier, avec contact direct WhatsApp/Appel,
sans messagerie interne ni espace de commentaires.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **Supabase** : base de données PostgreSQL, authentification par téléphone (OTP SMS),
  stockage des photos, temps réel
- **CinetPay** : paiements Mobile Money / Wave (Boost, Compte Pro, Alertes VIP, micro-paiements)

## Démarrage

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un nouveau projet (gratuit).
2. Dans **SQL Editor**, exécute le contenu de [`supabase/schema.sql`](supabase/schema.sql).
   Cela crée toutes les tables, les politiques de sécurité (RLS), les fonctions
   et insère des villes/quartiers d'exemple.
3. Active l'authentification par téléphone : **Authentication > Providers > Phone**.
   Configure un fournisseur SMS (Twilio, MessageBird, Vonage...) pour l'envoi des
   codes OTP.

### 2. Configurer les variables d'environnement

Copie `.env.local.example` en `.env.local` et renseigne :

- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (Dashboard Supabase > Project Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY` (même page — clé secrète, ne jamais exposer)
- `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` (Dashboard CinetPay > Intégration)
- `NEXT_PUBLIC_APP_URL` (URL publique de ton app, utilisée pour les redirections de paiement)

### 3. Lancer l'app

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- **Authentification** : inscription par Nom/Prénom/Téléphone + OTP SMS, sans email
- **Hub Local** : sélection Ville → Quartier, filtre tout le contenu de l'app
- **Fil principal** : annonces et événements en temps réel, filtres (Tout / Flash Marché / Événements / Formations)
- **Like + contact direct** (WhatsApp/Appel), pas de commentaires publics
- **Paywall** : 2 publications Flash gratuites/semaine, micro-paiement ensuite
- **Boost** : mise en avant payante (4h / 24h)
- **Compte Pro** : publications illimitées d'événements/formations + badge certifié
- **Alertes VIP** : abonnement SMS pour les nouveautés du quartier
- **Profil & Paramètres** : statistiques, confidentialité, notifications, thème clair/sombre

## PWA

L'app est installable sur mobile (Ajouter à l'écran d'accueil). Le manifeste et
le service worker se trouvent dans `public/`. Les icônes sont générées depuis
`public/icons/icon.svg` — remplace ce fichier par ton propre logo puis régénère
les PNG si besoin.

## Notes d'implémentation

- Les paiements (`src/app/api/payments/`) suivent le flux CinetPay : initiation
  côté serveur, redirection vers la page de paiement, confirmation via webhook
  qui finalise l'action (publication, boost ou abonnement).
- Les tarifs par défaut sont dans `src/lib/constants.ts` — à ajuster selon ta stratégie.
