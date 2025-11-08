// ============================================
// Community Types - Updated Structure
// ============================================

/**
 * Multilingual text object
 */
export interface MultilingualText {
  en: string
  ko: string
}

/**
 * Category types
 */
export type CategoryType = 'topic' | 'free'

/**
 * Topic IDs (for type safety)
 */
export type TopicId = 'antiaging' | 'wrinkles' | 'pigmentation' | 'acne' | 'surgery'

/**
 * Post tag IDs (for type safety)
 */
export type PostTagId = 'question' | 'review' | 'discussion'

export interface Member {
    uuid: string
    nickname: string
    name: string
    email: string
    avatar?: string
    created_at: string
    updated_at: string
  }

  /**
   * Community Post
   */
  export interface CommunityPost {
    id: number
    uuid_author: string
    title: string
    content: string

    // New structure: separated categorization
    topic_id: TopicId | null
    post_tag: PostTagId | null

    // Legacy field (for backward compatibility during migration)
    id_category?: string

    // Metadata
    view_count: number
    comment_count?: number
    like_count?: number

    // State
    is_deleted: boolean
    is_pinned?: boolean
    is_anonymous: boolean

    // Author snapshot
    author_name_snapshot?: string | null
    author_avatar_snapshot?: string | null

    // Timestamps
    created_at: string
    updated_at: string

    // Relations
    author?: Member
    category?: CommunityCategory
    topic?: CommunityCategory
    tag?: CommunityCategory
    is_liked?: boolean
  }

  /**
   * Community Comment
   */
  export interface CommunityComment {
    id: number
    id_post: number
    uuid_author: string
    content: string
    id_parent?: number
    is_deleted: boolean
    is_anonymous?: boolean
    created_at: string
    updated_at: string
    author?: Member
    replies?: CommunityComment[]
  }

  export interface CommunityLike {
    id: number
    id_post: number
    uuid_member: string
    created_at: string
  }

  export interface CommunityReport {
    id: number
    type_target: 'post' | 'comment'
    id_target: number
    uuid_reporter: string
    reason: string
    created_at: string
  }

  /**
   * Community Category
   * Used for both topics (navigation) and tags (post filtering)
   */
  export interface CommunityCategory {
    id: string
    name: string | MultilingualText
    description?: string | MultilingualText
    icon?: string
    category_type?: CategoryType
    display_order?: number
    is_active: boolean
    created_at?: string
    updated_at?: string
  }

/**
 * Display author information (handles anonymous)
 */
export interface DisplayAuthor {
  name: string
  avatar: string
  isAnonymous: boolean
}



// DTO용 보조 타입
export interface CountRow { id_post: number; count: number }
export interface CommunityPostsDTO {
  posts: CommunityPost[]
  commentsCount: CountRow[]
  likesCount: CountRow[]
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get display author from post (handles anonymous)
 */
export function getDisplayAuthor(post: CommunityPost): DisplayAuthor {
  if (post.is_anonymous) {
    return {
      name: 'Anonymous',
      avatar: '/logo/logo_icon.png',
      isAnonymous: true
    }
  }

  return {
    name: post.author_name_snapshot?.trim() || 'Unknown User',
    avatar: post.author_avatar_snapshot?.trim() || '/logo/logo_icon.png',
    isAnonymous: false
  }
}

/**
 * Get display author from comment (handles anonymous)
 */
export function getDisplayAuthorFromComment(comment: CommunityComment): DisplayAuthor {
  if (comment.is_anonymous) {
    return {
      name: 'Anonymous',
      avatar: '/logo/logo_icon.png',
      isAnonymous: true
    }
  }

  return {
    name: comment.author?.nickname || comment.author?.name || 'Unknown User',
    avatar: comment.author?.avatar || '/logo/logo_icon.png',
    isAnonymous: false
  }
}
