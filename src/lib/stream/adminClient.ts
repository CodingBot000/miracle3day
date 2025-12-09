import { StreamChat } from 'stream-chat';

let clientInstance: StreamChat | null = null;

/**
 * Get Stream Chat client instance for admin
 * This should only be used on the client side
 */
export function getStreamClient(apiKey: string): StreamChat {
  if (!clientInstance) {
    clientInstance = StreamChat.getInstance(apiKey);
  }
  return clientInstance;
}

/**
 * Disconnect Stream Chat client
 */
export async function disconnectStreamClient(): Promise<void> {
  if (clientInstance) {
    await clientInstance.disconnectUser();
    clientInstance = null;
  }
}
