import { BUCKET_USERS, STORAGE_MEMBER } from "@/constants/tables";

const API_BASE =
  process.env.NEXT_PUBLIC_API_ROUTE ||
  process.env.INTERNAL_API_BASE_URL ||
  "";

export interface UploadProfileImageParams {
  file: File;
  userUuid: string;
}

export interface UploadProfileImageResponse {
  success: boolean;
  imagePath?: string;
  error?: string;
}

export const uploadProfileImage = async ({
  file,
  userUuid,
}: UploadProfileImageParams): Promise<UploadProfileImageResponse> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${userUuid}.${fileExt}`;
    const filePath = `${STORAGE_MEMBER}/${userUuid}/${fileName}`;
    const folderPath = `${STORAGE_MEMBER}/${userUuid}`;

    // Delete existing files in the user's folder
    const listRes = await fetch(
      `${API_BASE}/api/storage/s3/list?bucket=${encodeURIComponent(
        BUCKET_USERS
      )}&prefix=${encodeURIComponent(folderPath)}`,
      { cache: 'no-store' }
    );

    if (!listRes.ok) {
      throw new Error(`Failed to list existing files (${listRes.status})`);
    }

    const listJson = await listRes.json();
    const existingFiles: Array<{ name?: string | null }> = listJson?.data ?? [];

    if (existingFiles.length > 0) {
      const filesToDelete = existingFiles
        .map((item) => item.name?.trim())
        .filter(Boolean)
        .map((name) => `${folderPath}/${name}`);

      if (filesToDelete.length > 0) {
        const removeRes = await fetch(`${API_BASE}/api/storage/s3/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket: BUCKET_USERS, paths: filesToDelete }),
        });

        if (!removeRes.ok) {
          throw new Error(`Failed to remove old images (${removeRes.status})`);
        }
      }
    }

    const signRes = await fetch(`${API_BASE}/api/storage/s3/sign-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bucket: BUCKET_USERS,
        key: filePath,
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      }),
    });

    if (!signRes.ok) {
      const message = await signRes.text();
      throw new Error(message || `Failed to sign upload (${signRes.status})`);
    }

    const { url } = await signRes.json();

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!putRes.ok) {
      const message = await putRes.text();
      throw new Error(message || `Failed to upload file (${putRes.status})`);
    }

    const storagePath = `${BUCKET_USERS}/${filePath}`;

    const patchRes = await fetch(`${API_BASE}/api/auth/member/avatar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: storagePath }),
    });

    if (!patchRes.ok) {
      const message = await patchRes.text();
      throw new Error(message || `Failed to update avatar (${patchRes.status})`);
    }

    const patchJson = await patchRes.json();
    const avatarUrl = patchJson?.avatarUrl;

    if (!avatarUrl) {
      return {
        success: false,
        error: 'Avatar URL update failed',
      };
    }

    return {
      success: true,
      imagePath: avatarUrl,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
