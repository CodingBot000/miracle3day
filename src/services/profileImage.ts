import { createClient } from "@/utils/session/client";
import { BUCKET_USERS, STORAGE_MEMBER, TABLE_MEMBERS } from "@/constants/tables";

const backendClient = createClient();

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
    const { data: existingFiles } = await backendClient.storage
      .from(BUCKET_USERS)
      .list(folderPath);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${folderPath}/${file.name}`);
      await backendClient.storage
        .from(BUCKET_USERS)
        .remove(filesToDelete);
    }

    const { error: uploadError } = await backendClient.storage
      .from(BUCKET_USERS)
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    const { data: publicData } = backendClient.storage
      .from(BUCKET_USERS)
      .getPublicUrl(filePath);

    const avatarPath = publicData.publicUrl;

    const { error: updateError } = await backendClient
      .from(TABLE_MEMBERS)
      .update({ avatar: avatarPath })
      .eq('uuid', userUuid);

    if (updateError) {
      console.error('Database update error:', updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return {
      success: true,
      imagePath: avatarPath,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};