import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type UploadableFile = {
  uri: string;
  name: string;
  type: string;
};

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function canUseUriDirectly(uri: string): boolean {
  return (
    Platform.OS === "web" ||
    uri.startsWith("file://") ||
    uri.startsWith("blob:") ||
    uri.startsWith("data:")
  );
}

function normalizePathUri(uri: string): string {
  const trimmed = uri.trim();
  if (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("ph://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `file://${trimmed}`;
  }
  return trimmed;
}

/**
 * React Native on Android may return content:// URIs that fetch cannot attach to FormData.
 * Copy to cache as file:// when needed. Web and file:// URIs are used as-is.
 */
export async function prepareUploadFile(
  uri: string,
  name: string,
  type?: string,
): Promise<UploadableFile> {
  const normalizedUri = normalizePathUri(uri);
  const safeName = name.replace(/[^\w.-]+/g, "_") || `image-${Date.now()}.jpg`;
  const mime = type?.trim() || mimeFromName(safeName);

  if (canUseUriDirectly(normalizedUri)) {
    return { uri: normalizedUri, name: safeName, type: mime };
  }

  const cache = FileSystem.cacheDirectory;
  if (!cache) {
    return { uri: normalizedUri, name: safeName, type: mime };
  }

  const dest = `${cache}upload-${Date.now()}-${safeName}`;
  try {
    await FileSystem.copyAsync({ from: normalizedUri, to: dest });
    return { uri: dest, name: safeName, type: mime };
  } catch {
    if (normalizedUri.startsWith("content://")) {
      throw new Error("Could not read media from device storage");
    }
    return { uri: normalizedUri, name: safeName, type: mime };
  }
}
