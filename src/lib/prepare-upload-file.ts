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

function needsCacheStaging(uri: string): boolean {
  if (Platform.OS === "web") return false;
  if (uri.startsWith("blob:") || uri.startsWith("data:")) return false;
  // Camera captures on Android use file:// under ImagePicker cache; uploadAsync
  // cannot read those paths reliably unless we copy into app cache first.
  if (Platform.OS === "android") return true;
  return !uri.startsWith("file://");
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

  if (!needsCacheStaging(normalizedUri)) {
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
  } catch (err) {
    if (normalizedUri.startsWith("content://")) {
      throw new Error("Could not read media from device storage");
    }
    if (Platform.OS === "android") {
      const message =
        err instanceof Error ? err.message : "Could not prepare media for upload";
      throw new Error(message);
    }
    return { uri: normalizedUri, name: safeName, type: mime };
  }
}
