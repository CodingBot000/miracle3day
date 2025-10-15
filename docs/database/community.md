-- 1) 기존 테이블 전부 제거
DROP TABLE IF EXISTS public.community_reports CASCADE;
DROP TABLE IF EXISTS public.community_likes CASCADE;
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.community_categories CASCADE;

-- 2) 카테고리 테이블 (무제약)
CREATE TABLE public.community_categories (
  id           text,
  name         text,
  description  text,
  order_index  integer DEFAULT 0,
  is_active    boolean DEFAULT true
) TABLESPACE pg_default;

-- 3) 댓글 테이블 (무제약)
CREATE TABLE public.community_comments (
  id           bigserial,
  id_post      bigint,
  uuid_author  uuid,
  content      text,
  id_parent    bigint,
  is_deleted   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_community_comments_post
  ON public.community_comments USING btree (id_post) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_community_comments_parent
  ON public.community_comments USING btree (id_parent) TABLESPACE pg_default;

-- 4) 좋아요 테이블 (무제약)
CREATE TABLE public.community_likes (
  id           bigserial,
  id_post      bigint,
  uuid_member  uuid,
  created_at   timestamptz DEFAULT now()
) TABLESPACE pg_default;

-- 5) 게시글 테이블 (무제약)
create table public.community_posts (
  id bigserial not null,
  uuid_author uuid null,
  title text null,
  content text null,
  id_category text null,
  view_count integer null default 0,
  is_deleted boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  author_name_snapshot text null,
  author_avatar_snapshot text null,
  constraint community_posts_pkey primary key (id)
  comment_count integer NOT NULL DEFAULT 0,
  like_count    integer NOT NULL DEFAULT 0,

) TABLESPACE pg_default;

create index IF not exists idx_community_posts_created_at on public.community_posts using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_community_posts_category on public.community_posts using btree (id_category) TABLESPACE pg_default;

create index IF not exists idx_community_posts_author on public.community_posts using btree (uuid_author) TABLESPACE pg_default;

  -- 이미 있음: comments(id_post) 인덱스 OK
CREATE INDEX IF NOT EXISTS idx_community_likes_post
  ON public.community_likes (id_post);

-- 좋아요 중복 방지 (회원당 게시글 1회)
CREATE UNIQUE INDEX IF NOT EXISTS uq_like_post_member
  ON public.community_likes (id_post, uuid_member);

-- 댓글 soft delete 필터링 성능
CREATE INDEX IF NOT EXISTS idx_comments_post_not_deleted
  ON public.community_comments (id_post)
  WHERE is_deleted = false;



-- 6) 신고 테이블 (무제약)
CREATE TABLE public.community_reports (
  id           bigserial,
  type_target  text,
  id_target    bigint,
  uuid_reporter uuid,
  reason       text,
  created_at   timestamptz DEFAULT now()
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_community_reports_target
  ON public.community_reports USING btree (type_target, id_target) TABLESPACE pg_default;
