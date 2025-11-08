'use client'

import { useState } from 'react'
import { CommunityComment, Member } from '@/app/models/communityData.dto'
import ReportButton from '@/components/atoms/button/ReportButton'

interface CommentItemProps {
  comment: CommunityComment
  currentUser: Member | null
  onDelete: (commentId: number) => void
  onReply: (parentId: number, content: string) => void
  depth: number
}

export default function CommentItem({
  comment,
  currentUser,
  onDelete,
  onReply,
  depth
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAuthor = currentUser ? currentUser.uuid === comment.uuid_author : false

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    await onReply(comment.id, replyContent)
    setReplyContent('')
    setIsReplying(false)
    setIsSubmitting(false)
  }

  return (
    <div className={`${depth > 0 ? 'ml-8' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.author?.nickname || 'Anonymous'}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            )}
            <ReportButton
              targetType="comment"
              targetId={comment.id}
            />
          </div>
        </div>
        <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
        {depth < 1 && currentUser && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Reply
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-2 ml-8">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Please write a reply."
            className="w-full p-3 border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsReplying(false)
                setReplyContent('')
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              disabled={!replyContent.trim() || isSubmitting}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
