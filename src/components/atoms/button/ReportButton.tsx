'use client'

import { useState } from 'react';

interface ReportButtonProps {
  targetType: 'post' | 'comment'
  targetId: number
}

export default function ReportButton({
  targetType,
  targetId,
}: ReportButtonProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reportReason,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to submit report');
      }

      alert('Your report has been submitted.');
      setIsReportModalOpen(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting:', error);
      alert('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsReportModalOpen(true)}
        className="text-gray-500 hover:text-red-600 text-sm"
      >
        Report
      </button>

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Report {targetType === 'post' ? 'Post' : 'Comment'}
            </h3>
            <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please enter the reason for reporting."
            className="w-full p-3 border rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim() || isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
