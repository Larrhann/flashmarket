export type PostType = "flash" | "event" | "formation";
export type PostStatut = "actif" | "expire" | "supprime";
export type ThemeMode = "light" | "dark" | "system";
export type VerificationStatut = "non_verifie" | "en_attente" | "verifie" | "refuse";
export type SubscriptionType = "pro" | "vip_alertes";
export type SubscriptionStatut = "actif" | "expire" | "annule";
export type TransactionType =
  | "publication"
  | "boost"
  | "abonnement_pro"
  | "abonnement_vip";
export type TransactionStatut = "en_attente" | "reussi" | "echoue";

export interface Database {
  public: {
    Tables: {
      villes: {
        Row: { id: number; nom: string };
        Insert: { id?: number; nom: string };
        Update: { id?: number; nom?: string };
        Relationships: [];
      };
      quartiers: {
        Row: { id: number; ville_id: number; nom: string };
        Insert: { id?: number; ville_id: number; nom: string };
        Update: { id?: number; ville_id?: number; nom?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
          quartier_id: number | null;
          ville_id: number | null;
          is_pro: boolean;
          pro_expire_at: string | null;
          telephone_masque: boolean;
          theme: ThemeMode;
          notif_push: boolean;
          notif_sms: boolean;
          vip_alertes: boolean;
          vip_expire_at: string | null;
          verification_statut: VerificationStatut;
          cni_photo_url: string | null;
          cni_photo_url_verso: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
          quartier_id?: number | null;
          ville_id?: number | null;
          is_pro?: boolean;
          pro_expire_at?: string | null;
          telephone_masque?: boolean;
          theme?: ThemeMode;
          notif_push?: boolean;
          notif_sms?: boolean;
          vip_alertes?: boolean;
          vip_expire_at?: string | null;
          verification_statut?: VerificationStatut;
          cni_photo_url?: string | null;
          cni_photo_url_verso?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: number;
          user_id: string;
          type: PostType;
          titre: string;
          description: string | null;
          prix: number | null;
          photos: string[];
          quartier_id: number;
          ville_id: number;
          whatsapp_numero: string | null;
          appel_numero: string | null;
          is_boosted: boolean;
          boost_expire_at: string | null;
          likes_count: number;
          vues_count: number;
          statut: PostStatut;
          created_at: string;
          expires_at: string;
          categorie: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: PostType;
          titre: string;
          description?: string | null;
          prix?: number | null;
          photos?: string[];
          quartier_id: number;
          ville_id: number;
          whatsapp_numero?: string | null;
          appel_numero?: string | null;
          is_boosted?: boolean;
          boost_expire_at?: string | null;
          likes_count?: number;
          vues_count?: number;
          statut?: PostStatut;
          created_at?: string;
          expires_at?: string;
          categorie?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [];
      };
      likes: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          created_at: string;
        };
        Insert: { id?: number; post_id: number; user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
        Relationships: [];
      };
      publication_quota: {
        Row: { user_id: string; semaine: string; nb_publies: number };
        Insert: { user_id: string; semaine: string; nb_publies?: number };
        Update: Partial<Database["public"]["Tables"]["publication_quota"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: number;
          user_id: string;
          type: SubscriptionType;
          statut: SubscriptionStatut;
          date_debut: string;
          date_fin: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: SubscriptionType;
          statut?: SubscriptionStatut;
          date_debut?: string;
          date_fin: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: number;
          user_id: string;
          type: TransactionType;
          montant: number;
          statut: TransactionStatut;
          provider_ref: string | null;
          post_id: number | null;
          payload: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: TransactionType;
          montant: number;
          statut?: TransactionStatut;
          provider_ref?: string | null;
          post_id?: number | null;
          payload?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      toggle_like: {
        Args: { p_post_id: number };
        Returns: boolean;
      };
      increment_vues: {
        Args: { p_post_id: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Ville = Database["public"]["Tables"]["villes"]["Row"];
export type Quartier = Database["public"]["Tables"]["quartiers"]["Row"];
