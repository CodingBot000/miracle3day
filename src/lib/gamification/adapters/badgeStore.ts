import type { BadgeStore } from '../ports/badgeStore';

export function createBadgeStore(): BadgeStore {
  const warn = (method: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[badge-store] ${method} is disabled because Supabase has been removed.`);
    }
  };

  return {
    async getConfig() {
      warn('getConfig');
      return { 
        quiz_rules: {
          daily_full_reward_quota: 5,
          overflow_multiplier: 0.2,
          base_attempt_exp: 5,
          correct_bonus_exp: 1,
          streak_bonus_per_day: 0.05,
          streak_bonus_cap: 0.25,
          reset_tz: 'Asia/Seoul'
        }
      };
    },

    async getTodaySolvedCount() {
      warn('getTodaySolvedCount');
      return 0;
    },

    async getStreakDays() {
      warn('getStreakDays');
      return 0;
    },

    async appendActivity() {
      warn('appendActivity');
    },

    async addExp() {
      warn('addExp');
      return { newExp: 0, newLevel: 0 };
    },

    async bumpQuizMasterProgress() {
      warn('bumpQuizMasterProgress');
    },

    async ensureUserBadgeState() {
      warn('ensureUserBadgeState');
    },

    async getUserBadges() {
      warn('getUserBadges');
      return [];
    },

    async getBadgesMaster() {
      warn('getBadgesMaster');
      return [];
    },

    async getNextQuestion() {
      warn('getNextQuestion');
      return {
        id: 'stub-question',
        stem: 'Quiz data is temporarily unavailable.',
        options: ['Please check back later'],
        answerIndex: 0,
      };
    },
  };
}
