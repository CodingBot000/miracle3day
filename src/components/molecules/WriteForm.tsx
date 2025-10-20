'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/session/client'
import type { CommunityCategory } from '@/app/models/communityData.dto'
import { isAnonymousCategoryName } from '@/app/community/utils'
import { TABLE_MEMBERS } from '@/constants/tables'

interface WriteFormProps {
  authorUuid: string
  categories: CommunityCategory[]
  initialData?: {
    title: string
    content: string
    id_category?: string
  }
  postId?: number
}

export default function WriteForm({
  authorUuid,
  categories,
  initialData,
  postId
}: WriteFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [categoryId, setCategoryId] = useState<string>(initialData?.id_category || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const backendClient = createClient()
      const resolvedCategoryId = categoryId === '' ? null : categoryId
      const selectedCategory = resolvedCategoryId
        ? categories.find((category) => String(category.id) === resolvedCategoryId)
        : undefined
      const anonymousCategory = isAnonymousCategoryName(selectedCategory?.name)

      let authorNameSnapshot: string | null = null
      let authorAvatarSnapshot: string | null = null

      if (!anonymousCategory) {
        const { data: memberRow, error: memberError } = await backendClient
          .from(TABLE_MEMBERS)
          .select('nickname, avatar')
          .eq('uuid', authorUuid)
          .maybeSingle()

        if (memberError) {
          console.error('Failed to load author snapshot info:', memberError)
        }

        authorNameSnapshot = memberRow?.nickname?.trim() ? memberRow.nickname.trim() : null
        authorAvatarSnapshot = memberRow?.avatar?.trim() ? memberRow.avatar.trim() : null
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        id_category: resolvedCategoryId,
        uuid_author: authorUuid,
        author_name_snapshot: anonymousCategory ? null : authorNameSnapshot,
        author_avatar_snapshot: anonymousCategory ? null : authorAvatarSnapshot,
      }

      if (postId) {
        const { error } = await backendClient
          .from('community_posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString()
          })
          .eq('id', postId)

        if (!error) {
          router.push(`/community/post/${postId}`)
        } else {
          alert('An error occurred while editing the post.')
        }
      } else {
        const { data, error } = await backendClient
          .from('community_posts')
          .insert(postData)
          .select()
          .single()

        if (!error && data) {
          router.push(`/community/post/${data.id}`)
        } else {
          alert('An error occurred while creating the post.')
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error)
      alert('글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
