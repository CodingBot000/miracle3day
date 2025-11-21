'use client';

import { useState } from 'react';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useRouter } from 'next/navigation';
import { useLoginGuard } from '@/hooks/useLoginGuard';

interface PollCommentInputProps {
  onSubmit: (content: string, parentId?: number) => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  placeholder?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export default function PollCommentInput({
  onSubmit,
  isSubmitting,
  isAuthenticated,
  placeholder,
  showCancel = false,
  onCancel,
}: PollCommentInputProps) {
  const { language } = useCookieLanguage();
  const router = useRouter();
  const { requireLogin, loginModal } = useLoginGuard();
  const [content, setContent] = useState('');

  const defaultPlaceholder = language === 'ko' 
    ? '의견을 공유해주세요...' 
    : 'Share your thoughts...';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (!isAuthenticated) {
      if (!requireLogin()) {
        return;
      }
    }
    
    onSubmit(content);
    setContent('');
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">
            {language === 'ko' ? '댓글을 작성하려면 로그인이 필요합니다' : 'Please login to comment'}
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="text-pink-500 font-semibold hover:text-pink-600"
          >
            {language === 'ko' ? '로그인' : 'Login'}
          </button>
        </div>
        {loginModal}
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="poll-comment-input">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2 mt-2">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            disabled={isSubmitting}
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting 
            ? (language === 'ko' ? '작성 중...' : 'Posting...') 
            : (language === 'ko' ? '작성' : 'Post')
          }
        </button>
      </div>
    </form>
  );
}

