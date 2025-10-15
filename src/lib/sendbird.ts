import axios from "axios";

const APP_ID = process.env.SBBB_APP_ID || process.env.NEXT_PUBLIC_SBBB_APP_ID;
const API_TOKEN = process.env.SBBB_API_TOKEN;

console.log('[Sendbird] Initializing with APP_ID:', APP_ID ? 'Found' : 'Missing');
console.log('[Sendbird] API_TOKEN:', API_TOKEN ? 'Found' : 'Missing');

if (!APP_ID || !API_TOKEN) {
  console.error('[Sendbird] Missing credentials:', {
    APP_ID: APP_ID || 'undefined',
    API_TOKEN: API_TOKEN ? 'exists' : 'undefined',
    env: Object.keys(process.env).filter(k => k.includes('SBBB'))
  });
  throw new Error("Missing SBBB_APP_ID or SBBB_API_TOKEN");
}

const sb = axios.create({
  baseURL: `https://api-${APP_ID}.sendbird.com/v3`,
  headers: { "Api-Token": API_TOKEN, "Content-Type": "application/json" },
});

export async function upsertUser(userId: string, nickname?: string, profileUrl?: string) {
  try {
    console.log('[Sendbird] Creating user:', { userId, nickname });
    // POST /users - Create user if doesn't exist
    const response = await sb.post(`/users`, {
      user_id: userId,
      nickname: nickname ?? userId,
      profile_url: profileUrl ?? "",
      issue_access_token: false,
    });
    console.log('[Sendbird] User created successfully:', userId);
    return response.data;
  } catch (error: any) {
    console.log('[Sendbird] Create user error:', error.response?.data);
    // If user already exists (400104 or 400202), try to update instead
    if (error.response?.data?.code === 400104 || error.response?.data?.code === 400202) {
      console.log('[Sendbird] User exists, updating:', userId);
      const updateResponse = await sb.put(`/users/${encodeURIComponent(userId)}`, {
        nickname: nickname ?? userId,
        profile_url: profileUrl ?? "",
      });
      console.log('[Sendbird] User updated successfully:', userId);
      return updateResponse.data;
    }
    // For other errors, throw
    console.error('[Sendbird] Failed to upsert user:', error.response?.data || error.message);
    throw error;
  }
}

export async function createDistinct1to1Channel(a: string, b: string, meta?: any) {
  try {
    console.log('[Sendbird] Creating channel between:', { a, b });

    // meta.payload.name이 있으면 고객 닉네임으로 사용, 없으면 기본값
    const channelName = meta?.payload?.name || `consult_${a}_${b}`;

    const { data } = await sb.post(`/group_channels`, {
      user_ids: [a, b],
      is_distinct: true,
      name: channelName,
      custom_type: "consultation",
      data: meta ? JSON.stringify(meta) : undefined,
    });
    console.log('[Sendbird] Channel created successfully:', data.channel_url);
    return data as { channel_url: string };
  } catch (error: any) {
    console.error('[Sendbird] Failed to create channel:', error.response?.data || error.message);
    throw error;
  }
}

export async function getChannelList(userId: string) {
  const { data } = await sb.get(`/users/${encodeURIComponent(userId)}/my_group_channels`, {
    params: {
      show_member: true,
      show_read_receipt: true,
      order: "latest_last_message",
      limit: 100,
    },
  });
  return data;
}
