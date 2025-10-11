"use client";

import { SendBirdProvider, Channel } from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";

type Props = {
  appId: string;          // SBBB_APP_ID
  userId: string;         // members.uuid or hospital.id_uuid
  channelUrl: string;     // 서버에서 생성된 channel_url
};

export default function ChatClient({ appId, userId, channelUrl }: Props) {
  return (
    <SendBirdProvider appId={appId} userId={userId}>
      <div className="h-[80vh] border rounded overflow-hidden">
        <Channel channelUrl={channelUrl} />
      </div>
    </SendBirdProvider>
  );
}
