interface Window {
  Android?: {
    // FCM 관련 (기존)
    requestFcmToken: () => void;
    connectMemberToFcm: (memberId: string) => void;
    disconnectMemberFromFcm: () => void;

    // 설정 관련
    saveStartScreen: (screen: 'user' | 'admin') => void;
    getStartScreen: () => string;
    updateUserLanguage: () => void;
    updateStartScreen: (screen: 'user' | 'admin') => void;
  };
}
