/**
 * Type definitions for Jitsi consultation features
 */

export type ConsultationRole = "doctor" | "patient" | "guest";

export interface ConsultationRoomInfo {
  reservationId: string;
  roomName: string;
  displayName: string;
  role: ConsultationRole;
  subject?: string;
  password?: string;
}

export interface JitsiConfig {
  roomName: string;
  parentNode: HTMLElement;
  userInfo: {
    displayName: string;
  };
  configOverwrite?: {
    prejoinConfig?: { enabled: boolean };
    disableDeepLinking?: boolean;
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    [key: string]: any;
  };
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[];
    MOBILE_APP_PROMO?: boolean;
    SHOW_JITSI_WATERMARK?: boolean;
    SHOW_BRAND_WATERMARK?: boolean;
    [key: string]: any;
  };
  width: string;
  height: string;
}

export interface JitsiAPI {
  executeCommand: (command: string, ...args: any[]) => void;
  addEventListener: (event: string, callback: (...args: any[]) => void) => void;
  removeEventListener: (event: string, callback: (...args: any[]) => void) => void;
  dispose: () => void;
}
