import { createClient } from '@supabase/supabase-js';
import type { BadgeStore } from '../ports/badgeStore';

export function supabaseStore(): BadgeStore {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    async getConfig() {
      const { data, error } = await supabase
        .from('badges_config')
        .select('data')
        .eq('key', 'global')
        .single();

      if (error) throw error;
      return { quiz_rules: data.data.quiz_rules };
    },

    async getTodaySolvedCount(userId: string, ymd: string) {
      const { count, error } = await supabase
        .from('badges_activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', 'quiz_attempt')
        .filter('note->>date', 'eq', ymd);

      if (error) throw error;
      return count ?? 0;
    },

    async getStreakDays(userId: string, _ymd: string) {
      const { data, error } = await supabase
        .from('badges_user_state')
        .select('meta')
        .eq('user_id', userId)
        .eq('badge_code', 'quiz_streak')
        .maybeSingle();

      if (error) throw error;
      return (data?.meta as any)?.streak_days ?? 0;
    },

    async appendActivity({ userId, yyyymmdd, isCorrect, exp, idempotencyKey }) {
      const { error } = await supabase
        .from('badges_activity_logs')
        .insert({
          user_id: userId,
          activity_type: 'quiz_attempt',
          points: exp,
          badge_code: 'quiz_master',
          amount: isCorrect ? 1 : 0,
          note: { date: yyyymmdd, isCorrect, idempotencyKey }
        });

      if (error && !error.message.includes('duplicate')) throw error;
    },

    async addExp(userId: string, exp: number) {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('badges_user_profile')
        .select('exp, level')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentExp = profile?.exp ?? 0;
      const newExp = currentExp + exp;

      // Calculate new level based on thresholds
      const { data: config } = await supabase
        .from('badges_config')
        .select('data')
        .eq('key', 'global')
        .single();

      const thresholds = config?.data?.level_thresholds ?? [0, 100, 300, 700, 1500, 3000, 6000, 10000];
      let newLevel = 1;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (newExp >= thresholds[i]) {
          newLevel = i + 1;
          break;
        }
      }

      // Upsert profile
      const { error: upsertError } = await supabase
        .from('badges_user_profile')
        .upsert({
          user_id: userId,
          exp: newExp,
          level: newLevel,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      return { newExp, newLevel };
    },

    async bumpQuizMasterProgress(userId: string, deltaCorrect: number) {
      const { data: current, error: fetchError } = await supabase
        .from('badges_user_state')
        .select('progress, current_level')
        .eq('user_id', userId)
        .eq('badge_code', 'quiz_master')
        .maybeSingle();

      if (fetchError) throw fetchError;

      const newProgress = (current?.progress ?? 0) + deltaCorrect;

      // Get thresholds for quiz_master badge
      const { data: master } = await supabase
        .from('badges_master')
        .select('level_thresholds, max_level')
        .eq('code', 'quiz_master')
        .single();

      const thresholds = master?.level_thresholds ?? [10, 50, 100, 300, 1000];
      let newLevel = 0;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (newProgress >= thresholds[i]) {
          newLevel = i + 1;
          break;
        }
      }

      const isLevelUp = newLevel > (current?.current_level ?? 0);

      const { error: upsertError } = await supabase
        .from('badges_user_state')
        .upsert({
          user_id: userId,
          badge_code: 'quiz_master',
          progress: newProgress,
          current_level: newLevel,
          first_earned_at: current?.first_earned_at ?? (newLevel > 0 ? new Date().toISOString() : null),
          last_level_up_at: isLevelUp ? new Date().toISOString() : current?.last_level_up_at,
          last_progress_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    },

    async ensureUserBadgeState(userId: string, badgeCode: string) {
      const { data: exists } = await supabase
        .from('badges_user_state')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_code', badgeCode)
        .maybeSingle();

      if (!exists) {
        await supabase
          .from('badges_user_state')
          .insert({
            user_id: userId,
            badge_code: badgeCode,
            current_level: 0,
            progress: 0
          });
      }
    },

    async getUserBadges(userId: string) {
      const { data } = await supabase
        .from('badges_user_state')
        .select('badge_code, current_level')
        .eq('user_id', userId);

      return (data ?? []).map(d => ({ code: d.badge_code, level: d.current_level }));
    },

    async getBadgesMaster() {
      const { data } = await supabase
        .from('badges_master')
        .select('code, name, category, max_level');

      return data ?? [];
    },

    async getNextQuestion(_userId: string) {
      // Demo: Return a sample question. In production, implement logic to fetch from quiz database
      const questions = [
        {
          id: 'q-1',
          stem: '피부의 정상 pH 범위는?',
          options: ['3.0-4.0', '4.5-5.5', '6.0-7.0', '7.5-8.5'],
          answerIndex: 1
        },
        {
          id: 'q-2',
          stem: '보톡스 시술 후 권장되는 주의 사항은?',
          options: ['즉시 운동 가능', '4시간 동안 눕지 않기', '당일 사우나 가능', '시술 부위 마사지'],
          answerIndex: 1
        },
        {
          id: 'q-3',
          stem: '필러 시술의 일반적인 지속 기간은?',
          options: ['6개월-1년', '1년-1년 6개월', '2년-3년', '영구적'],
          answerIndex: 1
        }
      ];

      return questions[Math.floor(Math.random() * questions.length)];
    }
  };
}
