import admin from 'firebase-admin';

// Singleton 패턴으로 중복 초기화 방지
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
} else {
  console.log('✅ Firebase Admin already initialized');
}

export const firebaseAdmin = admin;
export const messaging = admin.messaging();
