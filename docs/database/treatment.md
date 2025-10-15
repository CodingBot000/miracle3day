-- 시술 정보 Root 테이블
create table public.treatments_root (
  id text not null,                                    -- 시술 고유 ID (Primary Key, 참조용)
  ko text not null,                                    -- 시술명 (한글)
  en text not null,                                    -- 시술명 (영문)
  group_id text not null,                              -- 유사 시술 그룹 ID (treatment_similar_groups.group_id 참조)
  summary jsonb not null default '{}'::jsonb,          -- 시술 요약 (다국어 지원 JSON)
  tags jsonb not null default '[]'::jsonb,             -- 태그 배열 (예: ["리프팅","비수술"])
  attributes jsonb not null default '{}'::jsonb,       -- 상세 속성 JSON (effect, downtime, pain, cost, recommended 등)

  -- attributes에서 파생된 계산 컬럼들 (조회 편의)
  pain_level text GENERATED ALWAYS as (((attributes -> 'pain') ->> 'level')) STORED null,              -- 통증 정도 (low/medium/high 등)
  pain_score_0_10 integer GENERATED ALWAYS as (((attributes -> 'pain') ->> 'pain_score_0_10')::integer) STORED null, -- 통증 점수 (0~10)
  effect_onset_weeks_min integer GENERATED ALWAYS as (((attributes -> 'effect') ->> 'onset_weeks_min')::integer) STORED null, -- 효과 발현 최소 주
  effect_onset_weeks_max integer GENERATED ALWAYS as (((attributes -> 'effect') ->> 'onset_weeks_max')::integer) STORED null, -- 효과 발현 최대 주
  duration_months_min integer GENERATED ALWAYS as (((attributes -> 'effect') ->> 'duration_months_min')::integer) STORED null, -- 효과 지속 최소 개월
  duration_months_max integer GENERATED ALWAYS as (((attributes -> 'effect') ->> 'duration_months_max')::integer) STORED null, -- 효과 지속 최대 개월
  cost_currency text GENERATED ALWAYS as ((attributes -> 'cost') ->> 'currency') STORED null,          -- 비용 통화 (KRW/USD 등)
  cost_from numeric GENERATED ALWAYS as (((attributes -> 'cost') ->> 'from')::numeric) STORED null,    -- 시작 가격
  rec_sessions_min integer GENERATED ALWAYS as (((attributes -> 'recommended') ->> 'sessions_min')::integer) STORED null, -- 권장 최소 시술 횟수
  rec_sessions_max integer GENERATED ALWAYS as (((attributes -> 'recommended') ->> 'sessions_max')::integer) STORED null, -- 권장 최대 시술 횟수
  rec_interval_weeks integer GENERATED ALWAYS as (((attributes -> 'recommended') ->> 'interval_weeks')::integer) STORED null, -- 권장 시술 간격 (주 단위)

  constraint treatments_root_pkey primary key (id)     -- PK: 시술 ID
) TABLESPACE pg_default;


-- 유사 시술 그룹 테이블
create table public.treatment_similar_groups (
  group_id text not null,              -- 그룹 고유 ID (Primary Key)
  ko text not null,                    -- 그룹명 (한글)
  en text not null,                    -- 그룹명 (영문)
  sort_order integer null default 0,   -- 그룹 정렬 우선순위
  icon text null,                      -- UI 아이콘용 (선택)
  color text null,                     -- UI 색상용 (선택)
  slug text null,                      -- URL slug (unique)
  is_active boolean null default true, -- 활성화 여부
  description jsonb null,              -- 그룹 설명 (JSON: 다국어 가능)

  constraint treatment_similar_groups_pkey primary key (group_id),
  constraint treatment_similar_groups_slug_key unique (slug)
) TABLESPACE pg_default;


-- 시술 별칭 매핑 테이블 (브랜드명/변형명을 root_id에 매핑)
create table public.treatments_alias (
  alias_id text not null,                      -- 별칭 ID (Primary Key, 예: shurink_universe)
  root_id text not null,                       -- 대표 시술 ID (treatments_root.id 참조)
  ko text not null,                            -- 별칭 한글 이름
  en text not null,                            -- 별칭 영문 이름
  created_at timestamp with time zone null default now(), -- 생성일시
  updated_at timestamp with time zone null default now(), -- 수정일시

  constraint treatments_alias_pkey primary key (alias_id)
) TABLESPACE pg_default;

-- root_id 조회용 인덱스
create index IF not exists idx_treatments_alias_root_id 
on public.treatments_alias using btree (root_id) TABLESPACE pg_default;

-- updated_at 자동 갱신 트리거
create trigger trg_treatments_alias_touch 
before update on treatments_alias 
for each row
execute function trg_touch_updated_at();


-- 단일 테이블: 토픽 + 부위 + 시술 배열(a/b/c) + 설명(d/e/f) + 카피(토픽별)
CREATE TABLE IF NOT EXISTS treatment_care_protocols (
  id TEXT PRIMARY KEY,                             -- 행 식별자: "<topic_id>__<area_id>"

  -- 토픽(대주제)
  topic_id TEXT NOT NULL,                          -- 토픽 id (소문자+언더스코어), 예: 'lifting_tightening'
  topic_title_ko TEXT NOT NULL,                    -- 토픽 한글명
  topic_title_en TEXT NOT NULL,                    -- 토픽 영문명
  topic_sort_order INT DEFAULT 0,                  -- 토픽 정렬 우선순위(작을수록 먼저)

  -- 토픽 카피(선택)
  concern_copy_ko TEXT,                            -- 토픽 카피 한글 (NULL 허용)
  concern_copy_en TEXT,                            -- 토픽 카피 영문 (NULL 허용)

  -- 부위(섹션)
  area_id TEXT NOT NULL,                           -- 부위 id (소문자+언더스코어), 예: 'face_all'
  area_name_ko TEXT NOT NULL,                      -- 부위 한글명
  area_name_en TEXT NOT NULL,                      -- 부위 영문명
  area_sort_order INT DEFAULT 0,                   -- 부위 정렬 우선순위(토픽 내)

  -- 시술 배열 (treatments_root.id 들)
  primary_treatment_ids TEXT[] NOT NULL DEFAULT '{}',  -- a) 대표 시술
  alt_treatment_ids     TEXT[] NOT NULL DEFAULT '{}',  -- b) 대체/보완 시술
  combo_treatment_ids   TEXT[] NOT NULL DEFAULT '{}',  -- c) 보완(병합) 권장 시술

  -- 텍스트 설명 (다국어)
  benefits_ko  TEXT NOT NULL DEFAULT '',           -- d) 보완 효과(디테일) - 한글
  benefits_en  TEXT NOT NULL DEFAULT '',           -- d) 보완 효과(디테일) - 영문
  sequence_ko  TEXT NOT NULL DEFAULT '',           -- e) 순서·간격(권장) - 한글
  sequence_en  TEXT NOT NULL DEFAULT '',           -- e) 순서·간격(권장) - 영문
  cautions_ko  TEXT NOT NULL DEFAULT '',           -- f) 주의/금기 - 한글
  cautions_en  TEXT NOT NULL DEFAULT '',           -- f) 주의/금기 - 영문

  -- 확장 필드
  meta JSONB DEFAULT '{}'::jsonb,                  -- (선택) 아이콘/태그/표시옵션 등

  created_at TIMESTAMPTZ DEFAULT NOW(),            -- 생성 시각
  updated_at TIMESTAMPTZ DEFAULT NOW(),            -- 수정 시각

  -- 토픽+부위 조합의 유니크 인덱스 (조회 성능/중복 방지)
  CONSTRAINT ux_treatment_care_protocols_topic_area UNIQUE (topic_id, area_id)
);
