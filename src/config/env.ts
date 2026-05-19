/// <reference types="node" />

const url = process.env.EXPO_PUBLIC_API_URL?.trim();

if (__DEV__ && !url) {
  console.warn(
    "[env] EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set your machine IP:port.",
  );
}

const storefrontBaseDomain =
  process.env.EXPO_PUBLIC_STOREFRONT_BASE_DOMAIN?.trim() || "localhost";

export const env = {
  apiBaseUrl: url ?? "",
  storefrontBaseDomain,
} as const;
