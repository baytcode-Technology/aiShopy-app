/// <reference types="node" />

import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_API_URL?.trim();

if (__DEV__ && !url) {
  console.warn(
    "[env] EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set your machine IP:port.",
  );
}

const storefrontBaseDomain =
  process.env.EXPO_PUBLIC_STOREFRONT_BASE_DOMAIN?.trim() || "aishopy.io";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? "";
const androidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? "";

export const env = {
  apiBaseUrl: url ?? "",
  storefrontBaseDomain,
  google: {
    webClientId,
    iosClientId,
    androidClientId: androidClientId || webClientId,
  },
} as const;

export function isGoogleSignInConfigured(): boolean {
  if (!env.google.webClientId) return false;
  if (Platform.OS === "ios") {
    return Boolean(env.google.iosClientId);
  }
  return true;
}

export function getGoogleSignInSetupHint(): string {
  if (!env.google.webClientId) {
    return "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env or EAS build env.";
  }
  if (Platform.OS === "ios" && !env.google.iosClientId) {
    return "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (iOS OAuth client for bundle com.aishopy.app).";
  }
  return "";
}
