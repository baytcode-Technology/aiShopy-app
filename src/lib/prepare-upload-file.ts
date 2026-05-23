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

/**
 * React Native on Android may return content:// URIs that fetch cannot attach to FormData.
 * Copy to cache as file:// when needed. Web and file:// URIs are used as-is.
 */
export async function prepareUploadFile(
  uri: string,
  name: string,
  type?: string,
): Promise<UploadableFile> {
  const safeName = name.replace(/[^\w.-]+/g, "_") || `image-${Date.now()}.jpg`;
  const mime = type?.trim() || mimeFromName(safeName);

  if (canUseUriDirectly(uri)) {
    return { uri, name: safeName, type: mime };
  }

  const cache = FileSystem.cacheDirectory;
  if (!cache) {
    return { uri, name: safeName, type: mime };
  }

  const dest = `${cache}upload-${Date.now()}-${safeName}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
    return { uri: dest, name: safeName, type: mime };
  } catch {
    return { uri, name: safeName, type: mime };
  }
}
