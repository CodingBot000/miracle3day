import admin from 'firebase-admin';

// Singleton 패턴으로 중복 초기화 방지
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized');
  }
}

export const firebaseAdmin = admin;

// Lazy initialization - 실제 사용 시점에만 초기화
export const getMessaging = () => {
  initializeFirebaseAdmin();
  return admin.messaging();
};
