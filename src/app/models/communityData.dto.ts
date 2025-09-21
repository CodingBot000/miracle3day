export interface Member {
    uuid: string
    nickname: string
    name: string
    email: string
    avatar?: string
    created_at: string
    updated_at: string
  }
  
  export interface CommunityPost {
    id: number
    uuid_author: string
    title: string
    content: string
    id_category?: string
    view_count: number
    comment_count?: number
    like_count?: number
    is_deleted: boolean
    created_at: string
    updated_at: string
    author?: Member
    category?: CommunityCategory
    is_liked?: boolean,
    author_name_snapshot?: string,
    author_avatar_snapshot?: string,
  }
  
  export interface CommunityComment {
    id: number
    id_post: number
    uuid_author: string
    content: string
    id_parent?: number
    is_deleted: boolean
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
  
  export interface CommunityCategory {
    id: string
    name: string
    description: string
    order_index: number
    is_active: boolean
  }



// DTO용 보조 타입
export interface CountRow { id_post: number; count: number }
export interface CommunityPostsDTO {
  posts: CommunityPost[]
  commentsCount: CountRow[]
  likesCount: CountRow[]
}
