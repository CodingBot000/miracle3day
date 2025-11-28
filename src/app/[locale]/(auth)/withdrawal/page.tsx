'use client';

import { withdrawAction } from './actions';
import Link from 'next/link';
import { ROUTE } from '@/router';
import { useState } from 'react';

export default function WithdrawalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
        >
          Yes, delete my account
        </button>
        <Link
          href={ROUTE.MY_PAGE}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center"
        >
          No, take me back
        </Link>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Are you absolutely sure?
              </h2>
              <p className="text-gray-600 text-sm">
                This action <span className="font-semibold text-red-600">cannot be undone</span>. All your data will be permanently deleted.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const result = await withdrawAction();
                    if (result.success) {
                      window.location.href = '/';
                    }
                  } catch (error) {
                    console.error('Withdrawal error:', error);
                    alert('Failed to withdraw. Please try again.');
                    setIsSubmitting(false);
                    setShowConfirmModal(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting account...' : 'Withdraw'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
