'use client'

import { useState, type ChangeEvent } from 'react';
import type { CommunityCategory, TopicId, PostTagId } from '@/models/communityData.dto';
import { useNavigation } from '@/hooks/useNavigation';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { handleNotifications } from '@/utils/notificationHandler';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import type { LevelUpNotification } from '@/types/badge';
import { compressMultipleImages } from '@/utils/imageCompression';

interface SelectedImage {
  file: File;
  preview: string;
}

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
    images?: string[];
  };
  postId?: number;
  // URL params에서 전달받은 기본값 (새 글 작성 시 사용)
  defaultTopic?: string;
  defaultTag?: string;
}

export default function WriteForm({
  authorNameSnapshot,
  authorAvatarSnapshot,
  categories,
  initialData,
  postId,
  defaultTopic,
  defaultTag,
}: WriteFormProps) {
  const { navigate, goBack } = useNavigation();
  const locale = useLocale();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  // initialData가 있으면 (수정 모드) 그 값을 사용, 없으면 defaultTopic/defaultTag 사용
  const [topicId, setTopicId] = useState<string>(initialData?.topic_id || defaultTopic || '');
  const [postTag, setPostTag] = useState<string>(initialData?.post_tag || defaultTag || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levelUp, setLevelUp] = useState<LevelUpNotification | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [isCompressing, setIsCompressing] = useState(false);

  const MAX_IMAGES = 5;
  const availableSlots = MAX_IMAGES - existingImages.length - selectedImages.length;

  const topicCategories = categories.filter(c => c.category_type === 'topic');
  const tagCategories = categories.filter(c => c.category_type === 'free');

  // Image selection handler
  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const toProcess = files.slice(0, availableSlots);
    if (toProcess.length === 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsCompressing(true);
    try {
      const { results, errors } = await compressMultipleImages(toProcess, 'community_posting');

      if (errors.length > 0) {
        toast.error(`Failed to compress ${errors.length} image(s)`);
      }

      // Filter successful results only
      const successfulResults = results.filter(r => r.success);
      const newImages = successfulResults.map(r => ({
        file: r.compressedFile,
        preview: URL.createObjectURL(r.compressedFile),
      }));

      setSelectedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('Failed to process images');
    } finally {
      setIsCompressing(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Remove selected image (before upload)
  const handleRemoveSelectedImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const newImages = prev.filter((_, idx) => idx !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove].preview);
      return newImages;
    });
  };

  // Delete existing image (already uploaded - for edit mode)
  const handleDeleteExistingImage = async (imagePath: string) => {
    if (!postId) return;
    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(
        `/api/community/posts/${postId}/images?path=${encodeURIComponent(imagePath)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete image');

      setExistingImages(prev => prev.filter(p => p !== imagePath));
      toast.success('Image deleted');
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Failed to delete image');
    }
  };

  // Delete all existing images (for edit mode)
  const handleDeleteAllImages = async () => {
    if (!postId) return;
    if (!confirm('Delete all images?')) return;

    try {
      const response = await fetch(`/api/community/posts/${postId}/images`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete images');

      setExistingImages([]);
      toast.success('All images deleted');
    } catch (error) {
      console.error('Delete all images error:', error);
      toast.error('Failed to delete images');
    }
  };

  // Upload images after post creation
  const uploadImages = async (targetPostId: number) => {
    if (selectedImages.length === 0) return;

    const formData = new FormData();
    selectedImages.forEach(img => {
      formData.append('images', img.file);
    });

    const response = await fetch(`/api/community/posts/${targetPostId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to upload images');
    }

    // Cleanup previews
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
  };

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

        // Upload new images if any
        if (selectedImages.length > 0) {
          await uploadImages(postId);
        }

        const data = await response.json();
        if (data?.post?.id) {
          navigate(`/community/post/${data.post.id}`);
        } else {
          navigate(`/community/post/${postId}`);
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
        const newPostId = data?.id || data?.post?.id;

        // Upload images after post creation
        if (newPostId && selectedImages.length > 0) {
          await uploadImages(newPostId);
        }

        // Handle badge notifications (only for create, not edit)
        if (data?.notifications) {
          const levelUpNotification = handleNotifications(data.notifications);
          if (levelUpNotification) {
            setLevelUp(levelUpNotification);
          }
        }

        // 작성 완료 후 해당 토픽의 리스트 페이지로 이동
        // 사용자가 작성한 글이 바로 보이도록 함
        const redirectParams = new URLSearchParams();
        redirectParams.set('view', 'posts');
        if (topicId) redirectParams.set('topic', topicId);
        if (postTag) redirectParams.set('tag', postTag);

        navigate(`/community?${redirectParams.toString()}`)
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

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (Optional, max {MAX_IMAGES})
        </label>

        {/* Existing Images (Edit Mode) */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Attached Images ({existingImages.length}/{MAX_IMAGES})
              </span>
              <button
                type="button"
                onClick={handleDeleteAllImages}
                className="text-red-500 text-xs hover:underline"
              >
                Delete All
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((imageUrl, idx) => (
                <div key={idx} className="relative w-20 h-20 group">
                  <img
                    src={imageUrl}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(imageUrl)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Images (Not uploaded yet) */}
        {selectedImages.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-2">
              New Images ({selectedImages.length})
            </span>
            <div className="flex gap-2 flex-wrap">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 group">
                  <img
                    src={img.preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Input */}
        {availableSlots > 0 && (
          <div className="flex items-center gap-2">
            <label
              className={`px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${
                isCompressing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCompressing ? 'Processing...' : `Add Images (${availableSlots} left)`}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={isCompressing || availableSlots <= 0}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => goBack()}
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
