import { StreamChat } from 'stream-chat';

let clientInstance: StreamChat | null = null;

/**
 * Stream Chat client singleton
 * 서버/클라이언트 양쪽에서 사용 가능
 */
export function getStreamClient(apiKey?: string): StreamChat {
  // 이미 인스턴스가 있으면 재사용
  if (clientInstance) {
    return clientInstance;
  }

  // API Key 확인
  const key = apiKey || process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!key) {
    throw new Error('Stream API Key is required');
  }

  clientInstance = StreamChat.getInstance(key);
  return clientInstance;
}

/**
 * 클라이언트 연결 해제
 */
export async function disconnectStreamClient() {
  if (clientInstance) {
    await clientInstance.disconnectUser();
    clientInstance = null;
  }
}
