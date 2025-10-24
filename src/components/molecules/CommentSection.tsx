'use client'

import { useState } from 'react';
import { CommunityComment, Member } from '@/app/models/communityData.dto';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: number
  comments: CommunityComment[]
  currentUser: Member
}

export default function CommentSection({
  postId,
  comments: initialComments,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countComments = (items: CommunityComment[]): number => {
    return items.reduce((total, item) => {
      const replies = item.replies ?? [];
      return total + 1 + countComments(replies);
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to submit comment');
      }

      const data = await res.json();
      if (data?.comment) {
        const newCommentWithReplies = {
          ...data.comment,
          replies: data.comment.replies ?? [],
        } as CommunityComment;

        const nextComments = [...comments, newCommentWithReplies];
        setComments(nextComments);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred while posting the comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to delete comment');
      }

      const removeComment = (items: CommunityComment[]): CommunityComment[] => {
        return items
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };

      const nextComments = removeComment(comments);
      setComments(nextComments);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred while deleting the comment.');
    }
  };

  const handleReplySubmit = async (parentId: number, content: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to submit reply');
      }

      const data = await res.json();
      if (data?.comment) {
        const replyWithAuthor = {
          ...data.comment,
          replies: data.comment.replies ?? [],
        } as CommunityComment;

        const addReply = (items: CommunityComment[]): CommunityComment[] => {
          return items.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), replyWithAuthor],
              };
            }
            return {
              ...c,
              replies: c.replies ? addReply(c.replies) : [],
            };
          });
        };

        const nextComments = addReply(comments);
        setComments(nextComments);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('An error occurred while posting the reply.');
    }
  };

  const totalComments = countComments(comments);

  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="text-xl font-semibold mb-6">
        {totalComments} Comments
      </h3>

      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Please write a comment."
          className="w-full p-4 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onDelete={handleDeleteComment}
            onReply={handleReplySubmit}
            depth={0}
          />
        ))}
      </div>
    </div>
  )
}
