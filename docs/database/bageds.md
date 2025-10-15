-- (선택) UUID 생성을 위한 확장. Supabase 기본 제공이지만 안전하게 포함.
create extension if not exists pgcrypto;

--------------------------------------------------------------------------------
-- 1) badges_master : 배지(종류) 마스터
--    - 배지의 코드, 다국어 이름/설명, 카테고리, 최대 레벨, 레벨 임계치 등 정의
--    - i18n: name/description은 {"ko":"...", "en":"..."} 형태로 저장
--    - level_thresholds: 각 레벨 도달에 필요한 누적치 배열 (예: {10,50,100,300,1000})
--------------------------------------------------------------------------------
create table if not exists badges_master (
  id                uuid primary key default gen_random_uuid(),             -- 내부 식별자
  code              text unique not null,                                   -- 시스템용 배지 코드(예: 'quiz_master')
  name              jsonb not null,                                         -- 다국어 이름 {"ko":"퀴즈 마스터","en":"Quiz Master"}
  description       jsonb,                                                  -- 다국어 설명 {"ko":"...","en":"..."}
  category          text not null,                                          -- 분류: 'quiz' | 'attendance' | 'community' | 'challenge' | 'analysis' | ...
  max_level         int  not null default 1,                                 -- 배지 최대 레벨(업그레이드 상한)
  level_thresholds  int[] not null default '{}',                             -- 레벨별 필요 누적치 (레벨1~max_level까지의 요구량 배열)
  icon_url          text,                                                   -- 아이콘/이미지 경로
  meta              jsonb not null default '{}'::jsonb,                      -- 자유 확장 메타(예: {"unit":"days","unitLabel":{"ko":"일","en":"days"}})
  created_at        timestamptz not null default now(),                      -- 생성 시각
  updated_at        timestamptz not null default now()                       -- 갱신 시각(앱/함수에서 관리)
);

create index if not exists idx_badges_master_code on badges_master(code);


--------------------------------------------------------------------------------
-- 2) badges_user_state : 사용자별 배지 진행/보유 현황
--    - 각 사용자·배지 조합에 대한 현재 레벨/진행도(progress) 캐시
--    - 참조제약 없음: user_id, badge_code 는 문자열로만 연결
--    - unique(user_id, badge_code)로 중복 방지
--------------------------------------------------------------------------------
create table if not exists badges_user_state (
  id                uuid primary key default gen_random_uuid(),             -- 내부 식별자
  user_id           uuid not null,                                          -- 사용자 식별자(FK 미사용)
  badge_code        text not null,                                          -- 배지 코드(badges_master.code)와 논리 연결
  current_level     int  not null default 0,                                 -- 0=미보유, 1~max_level
  progress          int  not null default 0,                                 -- 누적 진행치(예: 정답 수, 출석 일수)
  first_earned_at   timestamptz,                                            -- 레벨 1 최초 획득 시각
  last_level_up_at  timestamptz,                                            -- 최근 레벨업 시각
  last_progress_at  timestamptz,                                            -- 최근 진행 반영 시각
  meta              jsonb not null default '{}'::jsonb,                      -- 자유 확장(세션 통계 등)
  updated_at        timestamptz not null default now(),                      -- 갱신 시각
  unique (user_id, badge_code)
);

create index if not exists idx_badges_user_state_user  on badges_user_state(user_id);
create index if not exists idx_badges_user_state_badge on badges_user_state(badge_code);


--------------------------------------------------------------------------------
-- 3) badges_user_profile : 사용자 통합 경험치/레벨
--    - 통합 EXP와 현재 통합 레벨, 칭호(i18n) 캐시
--    - 레벨 계산은 앱/함수에서 수행 후 결과만 반영(간결성/성능)
--------------------------------------------------------------------------------
create table if not exists badges_user_profile (
  user_id     uuid primary key,                                            -- 사용자 식별자(FK 미사용)
  exp         int  not null default 0,                                      -- 누적 EXP
  level       int  not null default 1,                                      -- 통합 레벨(계산 결과 캐시)
  title       jsonb not null default '{}'::jsonb,                           -- 다국어 칭호 {"ko":"뉴비","en":"Newbie"}
  updated_at  timestamptz not null default now()                            -- 갱신 시각
);


--------------------------------------------------------------------------------
-- 4) badges_config : 레벨 커브/EXP 규칙 등 전역 설정(싱글톤 구성 권장)
--    - level_thresholds: 통합 레벨 도달 누적 EXP 배열 (예: [0,100,300,700,...])
--    - exp_rules: 활동별 EXP 규칙(예: {"quiz_correct":10,"attendance":5,...})
--    - 하나의 row(key='global')에 모두 담아 운영(테이블 수/조인 최소화)
--------------------------------------------------------------------------------
create table if not exists badges_config (
  key         text primary key,                                             -- 구성 키(예: 'global')
  data        jsonb not null,                                               -- 설정 본문(JSON)
  updated_at  timestamptz not null default now()                            -- 갱신 시각
);

create index if not exists idx_badges_config_key on badges_config(key);


--------------------------------------------------------------------------------
-- (옵션) 5) badges_activity_logs : 활동 로그(운영·분석용)
--        - 큰 트래픽이 예상되면 파티셔닝/TTL 아카이빙 고려
--        - points: 해당 활동으로 부여된 EXP(없을 수도 있으니 0 허용)
--        - amount: 배지 진행도에 반영된 증가량(예: 퀴즈 정답 3문제면 3)
--------------------------------------------------------------------------------
create table if not exists badges_activity_logs (
  id            uuid primary key default gen_random_uuid(),                 -- 내부 식별자
  user_id       uuid not null,                                              -- 사용자 식별자(FK 미사용)
  activity_type text not null,                                              -- 'quiz_correct','attendance','community_post','skin_analysis','challenge_day',...
  points        int  not null default 0,                                     -- 부여 EXP(없으면 0)
  badge_code    text,                                                       -- 관련 배지 코드(없으면 null)
  amount        int  not null default 0,                                     -- 진행 증가량(예: 정답 3)
  note          jsonb not null default '{}'::jsonb,                          -- 상세(세션ID, 문제ID 등)
  created_at    timestamptz not null default now()                           -- 생성 시각
);

create index if not exists idx_badges_activity_logs_user on badges_activity_logs(user_id);
create index if not exists idx_badges_activity_logs_type on badges_activity_logs(activity_type);
create index if not exists idx_badges_activity_logs_badge on badges_activity_logs(badge_code);