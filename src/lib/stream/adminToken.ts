import { StreamChat } from 'stream-chat';

/**
 * Generate Stream Chat token for hospital admin (Server-side only)
 * This function should ONLY be called from API routes
 */
export async function generateAdminToken(
  hospitalId: string,
  hospitalName: string
): Promise<{ token: string; apiKey: string; hospitalId: string }> {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Stream API credentials not configured');
  }

  // Initialize server-side Stream client
  const serverClient = StreamChat.getInstance(apiKey, apiSecret);

  // Upsert hospital user
  await serverClient.upsertUser({
    id: hospitalId,
    name: hospitalName,
    user_type: 'hospital',
  } as Parameters<typeof serverClient.upsertUser>[0]);

  // Generate token for hospital user
  const token = serverClient.createToken(hospitalId);

  return {
    token,
    apiKey,
    hospitalId,
  };
}
