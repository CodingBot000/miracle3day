import { StreamChat } from 'stream-chat';

/**
 * 서버 사이드 전용 - Stream 사용자 토큰 생성
 * @param userId - members.id_uuid 또는 hospital.id_uuid_hospital
 */
export async function createUserToken(userId: string): Promise<string> {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('STREAM_API_KEY and STREAM_SECRET must be set in environment variables');
  }

  // 서버 사이드 client 생성
  const serverClient = StreamChat.getInstance(apiKey, apiSecret);

  // 토큰 생성
  const token = serverClient.createToken(userId);

  return token;
}

/**
 * 서버 사이드 전용 - Stream 사용자 Upsert
 * @param userId - members.id_uuid 또는 hospital.id_uuid_hospital
 * @param userData - 사용자 정보 (name, image 등)
 */
export async function upsertStreamUser(
  userId: string,
  userData?: {
    name?: string;
    image?: string;
    role?: string;
    user_type?: 'customer' | 'hospital';
    [key: string]: any;
  }
): Promise<void> {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('STREAM_API_KEY and STREAM_SECRET must be set in environment variables');
  }

  const serverClient = StreamChat.getInstance(apiKey, apiSecret);

  await serverClient.upsertUser({
    id: userId,
    role: userData?.role || 'user',
    ...userData,
  });
}
