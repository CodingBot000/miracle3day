'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import { isAnonymousCategoryName } from '@/app/community/utils';

interface WriteFormProps {
  authorNameSnapshot?: string | null;
  authorAvatarSnapshot?: string | null;
  categories: CommunityCategory[];
  initialData?: {
    title: string;
    content: string;
    id_category?: string;
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
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.id_category || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const resolvedCategoryId = categoryId === '' ? null : categoryId;
      const selectedCategory = resolvedCategoryId
        ? categories.find((category) => String(category.id) === resolvedCategoryId)
        : undefined;
      const anonymousCategory = isAnonymousCategoryName(selectedCategory?.name);

      const postData = {
        title: title.trim(),
        content: content.trim(),
        id_category: resolvedCategoryId,
        author_name_snapshot: anonymousCategory
          ? null
          : (authorNameSnapshot ?? null),
        author_avatar_snapshot: anonymousCategory
          ? null
          : (authorAvatarSnapshot ?? null),
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
        if (data?.post?.id) {
          router.push(`/community/post/${data.post.id}`);
        } else {
          router.push('/community');
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
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
          Content *
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
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : postId ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
