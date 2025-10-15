-- badges_config 테이블에 전역 설정 삽입 (이미 추가하셨다면 스킵)
INSERT INTO badges_config (key, data)
VALUES ('global', '{
  "quiz_rules": {
    "reset_tz": "Asia/Seoul",
    "base_attempt_exp": 5,
    "streak_bonus_cap": 0.25,
    "correct_bonus_exp": 1,
    "overflow_multiplier": 0.2,
    "perfect_session_size": 10,
    "streak_bonus_per_day": 0.05,
    "perfect_session_bonus": 10,
    "daily_full_reward_quota": 5
  },
  "level_thresholds": [0, 100, 300, 700, 1500, 3000, 6000, 10000]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

-- badges_master 테이블에 배지 정의 삽입
INSERT INTO badges_master (code, name, description, category, max_level, level_thresholds)
VALUES
  (
    'quiz_master',
    '{"ko": "퀴즈 마스터", "en": "Quiz Master"}'::jsonb,
    '{"ko": "퀴즈 정답을 누적하여 레벨업하세요", "en": "Level up by accumulating correct answers"}'::jsonb,
    'quiz',
    5,
    ARRAY[10, 50, 100, 300, 1000]
  ),
  (
    'quiz_streak',
    '{"ko": "연속 출석", "en": "Quiz Streak"}'::jsonb,
    '{"ko": "매일 퀴즈를 풀어 연속 기록을 유지하세요", "en": "Solve quizzes daily to maintain your streak"}'::jsonb,
    'quiz',
    4,
    ARRAY[3, 7, 14, 30]
  ),
  (
    'category_explorer',
    '{"ko": "탐험가", "en": "Category Explorer"}'::jsonb,
    '{"ko": "다양한 카테고리의 퀴즈를 풀어보세요", "en": "Explore different quiz categories"}'::jsonb,
    'quiz',
    4,
    ARRAY[3, 5, 8, 12]
  ),
  (
    'attendance_streak',
    '{"ko": "출석왕", "en": "Attendance King"}'::jsonb,
    '{"ko": "매일 방문하여 출석 기록을 쌓으세요", "en": "Visit daily to build your attendance record"}'::jsonb,
    'attendance',
    3,
    ARRAY[7, 30, 100]
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_level = EXCLUDED.max_level,
  level_thresholds = EXCLUDED.level_thresholds;

-- 테스트용 유저 프로필 생성 (mock user UUID)
INSERT INTO badges_user_profile (user_id, exp, level, title)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    0,
    1,
    '{"ko": "뉴비", "en": "Newbie"}'::jsonb
  )
ON CONFLICT (user_id) DO NOTHING;
