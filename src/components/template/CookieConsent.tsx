'use client';

 import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

const COOKIE_NAME = 'cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptAllCookies = () => {
    Cookies.set(COOKIE_NAME, 'accepted', {
      expires: 365,
      path: '/',
    });
    setShow(false);
  };

  const rejectCookies = () => {
    Cookies.set(COOKIE_NAME, 'rejected', {
      expires: 365,
      path: '/',
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-md z-50 text-sm text-gray-800">
      <div className="max-w-screen-md mx-auto">
        <p>
          Welcome to MimoTok - Your Free Clinic Booking Solution
          We use cookies to personalize content and to analyze our traffic.
          By clicking &quot;Accept and continue&quot; you agree with the use of analytical and tracking cookies. For more information, <Link href="" className="text-blue-600 underline hover:text-blue-800">check the Cookie Policy</Link>
        </p>
        <div className="mt-3 flex gap-2">
          {/* <button onClick={rejectCookies} className="bg-gray-200 px-4 py-2 rounded">
            Reject
          </button> */}
          <button onClick={acceptAllCookies} className="bg-blue-600 text-white px-4 py-2 rounded">
            “Accept and continue
          </button>
        </div>
      </div>
    </div>
  );
}