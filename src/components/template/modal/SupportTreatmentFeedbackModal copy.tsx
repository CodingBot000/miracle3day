'use client';

import { useState, useEffect } from 'react';

interface SupportTreatmentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_uuid_hospital: string;
  initialFeedback?: string;
  onFeedbackSaved?: (feedback: string) => void;
}

export default function SupportTreatmentFeedbackModal({
  isOpen,
  onClose,
  id_uuid_hospital,
  initialFeedback = '',
  onFeedbackSaved,
}: SupportTreatmentFeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 초기 피드백 내용 설정
  useEffect(() => {
    if (isOpen) {
      setFeedback(initialFeedback);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialFeedback]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/admin/upload/step6/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_uuid_hospital,
          feedback_content: feedback,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '피드백 저장에 실패했습니다.');
      }

      console.log('Feedback submitted successfully:', result);

      // 부모 컴포넌트에 저장된 피드백 전달
      if (onFeedbackSaved) {
        onFeedbackSaved(feedback);
      }

      alert('피드백이 성공적으로 저장되었습니다.');
      onClose();
    } catch (error) {
      console.error('피드백 저장 중 오류:', error);
      alert(error instanceof Error ? error.message : '피드백 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Feedback</h2>
        
        <p className="text-gray-600 mb-4">
        제공한 리스트외에 추가 하고 싶으신 항목 혹은 잘못된 수정되어야할 항목을 피드백주시면 반영하겠습니다.  <br />
        제공 시술에 대해 의견을 주실때는 부위별로 상세히 기재부탁드립니다.  <br />
        또한 본 화면의 UI/UX 적으로 사용상에 불편한점 개선했으면 하는점이 있으시다면 소중한 의견부탁드립니다.  <br />
        감사합니다.
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your feedback here..."
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
