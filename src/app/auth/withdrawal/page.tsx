// 'use client';
export const dynamic = "force-dynamic";

import { withdrawAction } from './actions';
import Link from 'next/link';
import { ROUTE } from '@/router';

export default function WithdrawalPage() {
  const message = {
    title: "Are you sure you want to leave us?",
    body1: "We're truly sorry to see you go. Withdrawing your account will permanently delete all your data, including your personalized recommendations, saved clinics, consultation history, and preferences.",
    body2: "If there's anything we can do to improve your experience, please let us know — your voice helps us build a better service.",
    body3: "This action cannot be undone. Please take a moment to consider if you'd like to stay connected with the beauty community you've started building with us."
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-xl font-bold mb-6 text-center">
        {message.title}
      </h1>
      <p className="text-gray-600 mb-8 text-center leading-relaxed">
        {message.body1}
        <br /><br />
        {message.body2}
        <br /><br />
        {message.body3}
      </p>
      <div className="flex flex-col gap-4">
        <form action={withdrawAction} className="w-full">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
          >
            Yes, delete my account
          </button>
        </form>
        <Link 
          href={ROUTE.MY_PAGE}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center"
        >
          No, take me back
        </Link>
      </div>
    </div>
  );
}
