'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CommunityCategory, TopicId, PostTagId } from '@/app/models/communityData.dto';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { handleNotifications } from '@/utils/notificationHandler';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import type { LevelUpNotification } from '@/types/badge';

interface WriteFormProps {
  authorNameSnapshot?: string | null;
  authorAvatarSnapshot?: string | null;
  categories: CommunityCategory[];
  initialData?: {
    title: string;
    content: string;
    topic_id?: TopicId;
    post_tag?: PostTagId;
    is_anonymous?: boolean;
  };
  postId?: number;
}

export default function WriteForm({
  authorNameSnapshot,
  authorAvatarSnapshot,
  categories,
  initialData,
  postId,
}: WriteFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [topicId, setTopicId] = useState<string>(initialData?.topic_id || '');
  const [postTag, setPostTag] = useState<string>(initialData?.post_tag || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levelUp, setLevelUp] = useState<LevelUpNotification | null>(null);

  const topicCategories = categories.filter(c => c.category_type === 'topic');
  const tagCategories = categories.filter(c => c.category_type === 'free');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || isSubmitting) return;

    // CRITICAL: Validate topic selection
    if (!topicId || topicId === '') {
      toast.error('Please select a topic category');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        topic_id: topicId as TopicId,
        post_tag: postTag || null,
        is_anonymous: isAnonymous,
        author_name_snapshot: isAnonymous ? null : (authorNameSnapshot ?? null),
        author_avatar_snapshot: isAnonymous ? null : (authorAvatarSnapshot ?? null),
      };

      if (postId) {
        const response = await fetch(`/api/community/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to update post');
        }

        const data = await response.json();
        if (data?.post?.id) {
          router.push(`/community/post/${data.post.id}`);
        } else {
          router.push(`/community/post/${postId}`);
        }
      } else {
        const response = await fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to create post');
        }

        const data = await response.json();

        // Handle badge notifications (only for create, not edit)
        if (data?.notifications) {
          const levelUpNotification = handleNotifications(data.notifications);
          if (levelUpNotification) {
            setLevelUp(levelUpNotification);
          }
        }

        if (data?.post?.id) {
          router.push(`/community/post/${data.post.id}`);
        } else {
          router.push('/community');
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.success('글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic Selection - REQUIRED */}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
          Topic <span className="text-red-500">*</span>
        </label>
        <select
          id="topic"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">-- Select a topic --</option>
          {topicCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon && `${category.icon} `}{typeof category.name === 'string' ? category.name : (category.name as any)?.[locale] || (category.name as any)?.ko || ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tag Selection - OPTIONAL */}
      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
          Tag (Optional)
        </label>
        <select
          id="tag"
          value={postTag}
          onChange={(e) => setPostTag(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- No tag (optional) --</option>
          {tagCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon && `${category.icon} `}{typeof category.name === 'string' ? category.name : (category.name as any)?.[locale] || (category.name as any)?.ko || ''}
            </option>
          ))}
        </select>
      </div>

      {/* Anonymous Checkbox */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Post anonymously
          </span>
        </label>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Please enter the title"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Please enter the content"
          className="w-full p-4 border rounded-lg resize-none h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || !topicId || isSubmitting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : postId ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Level-up modal */}
      {levelUp && (
        <LevelUpModal
          level={levelUp.level}
          exp={levelUp.exp}
          onClose={() => setLevelUp(null)}
        />
      )}
    </form>
  )
}
