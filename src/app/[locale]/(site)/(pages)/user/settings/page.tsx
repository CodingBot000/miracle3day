'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Auth {
  provider: string;
  email: string;
  name: string;
  avatar: string;
  role?: string;
  hospitalAccess?: Array<{
    hospital_id: string;
    hospital_name: string;
  }>;
}

interface Preferences {
  app_start_screen: 'user' | 'admin';
  language: string | null;
  notifications: {
    push: boolean;
    email: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    app_start_screen: 'user',
    language: null,
    notifications: {
      push: true,
      email: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 세션 확인
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (!sessionData.auth) {
        router.push('/login');
        return;
      }

      setAuth(sessionData.auth);

      // 설정 조회
      const prefsRes = await fetch('/api/user/preferences');
      const prefsData = await prefsRes.json();

      if (prefsData.preferences) {
        setPreferences(prefsData.preferences);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // DB에 저장
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      // Android 앱에도 저장
      if (preferences.app_start_screen && window.Android) {
        window.Android.updateStartScreen(preferences.app_start_screen);
      }

      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* 사용자 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <div className="flex items-center space-x-4">
          {auth.avatar && (
            <img
              src={auth.avatar}
              alt={auth.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{auth.name}</p>
            <p className="text-sm text-gray-600">{auth.email}</p>
            {auth.role === 'hospital_admin' && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 관리자 전용 섹션 */}
      {auth.role === 'hospital_admin' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 mb-6 border-2 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Settings
          </h2>

          {/* 관리 중인 병원 */}
          {auth.hospitalAccess && auth.hospitalAccess.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded border border-blue-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Managing Hospitals</p>
              <ul className="space-y-1">
                {auth.hospitalAccess.map((hospital) => (
                  <li key={hospital.hospital_id} className="text-sm text-gray-900">
                    • {hospital.hospital_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 앱 시작 화면 설정 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Start Screen
            </label>
            <select
              value={preferences.app_start_screen}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  app_start_screen: e.target.value as 'user' | 'admin',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">User Home</option>
              <option value="admin">Admin Dashboard</option>
            </select>
            <p className="mt-2 text-xs text-gray-600">
              Select the default screen when the app starts
            </p>
          </div>

          {/* 관리자 페이지 이동 버튼 */}
          <button
            onClick={() => router.push('/admin')}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Go to Admin Page
          </button>
        </div>
      )}

      {/* 일반 설정 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications in the app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      push: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      email: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 언어 설정 (읽기 전용) */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Language Settings</h2>
        <p className="text-sm text-gray-600 mb-2">
          Current language: <span className="font-medium">{preferences.language || 'Using device language'}</span>
        </p>
        <p className="text-xs text-gray-500">
          Language automatically follows device settings
        </p>
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
