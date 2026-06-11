export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  wa_phone_number_id: string | null;
  wa_waba_id: string | null;
  wa_access_token: string | null;
  currency: string;
  timezone: string;
  payment_config: Record<string, unknown>;
  ai_system_prompt: string | null;
  ai_language: string | null;
  industry: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MyStoreResponse = {
  success: boolean;
  message: string;
  data: {
    hasStore: boolean;
    store: Store | null;
  };
};

export type CreateStorePayload = {
  name: string;
  slug: string;
  whatsapp_number: string;
  currency: string;
  description?: string | null;
  industry?: string | null;
  logo_url?: string | null;
};

/** Partial PATCH — only send fields that changed. */
export type UpdateStorePayload = Partial<{
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  currency: string;
  timezone: string;
  industry: string | null;
  ai_system_prompt: string | null;
  ai_language: string | null;
  is_active: boolean;
}>;

export type UpdateStoreResponse = {
  success: boolean;
  message: string;
  data: { store: Store };
};

export type CreateStoreResponse = {
  success: boolean;
  message: string;
  data: {
    store: Store;
    subdomainUrl: string;
  };
};

export type StoreSession = {
  storeId: string;
  slug: string;
  name: string;
  subdomainUrl: string;
};
