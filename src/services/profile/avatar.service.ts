import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export const AVATAR_BUCKET = "avatars";
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const AVATAR_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type StorageClient = SupabaseClient<Database>;

export function validateAvatarFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return { file: null, error: null };
  }

  if (!Object.hasOwn(AVATAR_MIME_TYPES, value.type)) {
    return { file: null, error: "Use uma imagem JPEG, PNG ou WebP." };
  }

  if (value.size > MAX_AVATAR_SIZE_BYTES) {
    return { file: null, error: "A imagem deve ter no máximo 5 MB." };
  }

  return { file: value, error: null };
}

export async function uploadUserAvatar(
  supabase: StorageClient,
  userId: string,
  file: File,
) {
  const extension = AVATAR_MIME_TYPES[file.type as keyof typeof AVATAR_MIME_TYPES];
  const avatarPath = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  return { path: error ? null : avatarPath, error };
}

export async function removeUserAvatar(
  supabase: StorageClient,
  avatarPath: string | null | undefined,
) {
  if (!avatarPath) {
    return null;
  }

  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath]);

  return error;
}

export function getPublicAvatarUrl(
  supabase: StorageClient,
  avatarPath: string | null | undefined,
) {
  if (!avatarPath) {
    return null;
  }

  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath).data.publicUrl;
}
