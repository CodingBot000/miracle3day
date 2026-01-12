/**
 * Personalized Guide Filtering Logic
 * Matches user conditions to relevant skincare articles and guidelines
 */

import { UserCondition, AGE_MAPPING } from './types';

// Import JSON data
import ageSpecificData from '../data/articles/age-specific.json';
import routineData from '../data/articles/routine.json';
import sunProtectionData from '../data/articles/sun-protection.json';
import quickTipsData from '../data/guidelines/quick-tips.json';
import categoriesData from '../data/categories.json';

// Types for JSON data
export interface Article {
  id: string;
  titleKey?: string;
  descriptionKey?: string;
  title_key?: string;
  summary_key?: string;
  category_id?: string;
  subcategory_id?: string;
  level?: string;
  tags?: string[];
  applicable_to?: {
    skin_types?: string[];
    concerns?: string[];
    age_groups?: string[];
  };
  keyMessages?: {
    titleKey: string;
    contentKey: string;
    priority: number;
  }[];
  ageRange?: {
    min: number;
    max: number;
  };
  targetDemographic?: string;
  skinConcerns?: string[];
  lifestyleRecommendations?: string[];
  essentialProducts?: {
    type: string;
    requirement: string;
    frequency: string;
    benefits?: string[];
  }[];
  expertQuotes?: {
    quote: string;
    author: string;
  }[];
  source?: {
    name: string;
    url: string;
    authors?: string[];
    lastReviewed?: string;
  };
}

export interface Guideline {
  id: string;
  type: string;
  title_key: string;
  content_key: string;
  conditions: {
    skin_type?: string;
    product_type?: string;
    time_of_day?: string;
  };
  priority: number;
  reference_url?: string;
}

export interface PersonalizedGuide {
  ageArticle: Article | null;
  relevantArticles: Article[];
  guidelines: Guideline[];
  quickTips: Guideline[];
}

// Convert age group to numeric range
function ageGroupToNumeric(ageGroup: string): { min: number; max: number } {
  switch (ageGroup) {
    case '20s':
      return { min: 20, max: 29 };
    case '30s':
      return { min: 30, max: 39 };
    case '40s-50s':
      return { min: 40, max: 59 };
    case '60s+':
      return { min: 60, max: 100 };
    default:
      return { min: 20, max: 100 };
  }
}

// Find age-specific article
function findAgeArticle(ageGroup: string): Article | null {
  const articleId = AGE_MAPPING[ageGroup];
  if (!articleId) return null;

  const article = ageSpecificData.articles.find(
    (a: Article) => a.id === articleId
  );
  return article || null;
}

// Filter articles by skin type and concerns
function filterRelevantArticles(
  skinType: string,
  concerns: string[]
): Article[] {
  const allArticles: Article[] = [
    ...routineData.articles,
    ...sunProtectionData.articles,
  ];

  const scored = allArticles.map((article) => {
    let score = 0;

    // Check skin type match
    if (article.applicable_to?.skin_types) {
      if (
        article.applicable_to.skin_types.includes('all') ||
        article.applicable_to.skin_types.includes(skinType)
      ) {
        score += 2;
      }
    }

    // Check concerns match
    if (article.applicable_to?.concerns && concerns.length > 0) {
      const matchingConcerns = concerns.filter(
        (c) =>
          article.applicable_to?.concerns?.includes('all') ||
          article.applicable_to?.concerns?.includes(c) ||
          article.tags?.includes(c)
      );
      score += matchingConcerns.length;
    }

    // Boost basic/beginner articles
    if (article.level === 'beginner') {
      score += 1;
    }

    return { article, score };
  });

  // Sort by score and return top articles
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.article);
}

// Filter guidelines by user conditions
function filterGuidelines(skinType: string, concerns: string[]): Guideline[] {
  const allGuidelines = quickTipsData.guidelines as Guideline[];

  const filtered = allGuidelines.filter((guideline) => {
    // No conditions = universal guideline
    if (!guideline.conditions || Object.keys(guideline.conditions).length === 0) {
      return true;
    }

    // Check skin type match
    if (guideline.conditions.skin_type) {
      if (guideline.conditions.skin_type !== skinType) {
        return false;
      }
    }

    return true;
  });

  // Sort by priority
  return filtered.sort((a, b) => b.priority - a.priority);
}

// Get personalized skincare guide
export function getPersonalizedGuide(condition: UserCondition): PersonalizedGuide {
  // Find age-specific article
  const ageArticle = findAgeArticle(condition.ageGroup);

  // Find relevant articles based on skin type and concerns
  const relevantArticles = filterRelevantArticles(
    condition.skinType,
    condition.concerns
  );

  // Get relevant guidelines
  const allGuidelines = filterGuidelines(condition.skinType, condition.concerns);

  // Separate quick tips (universal) from specific guidelines
  const quickTips = allGuidelines.filter(
    (g) => !g.conditions.skin_type && !g.conditions.product_type
  );
  const guidelines = allGuidelines.filter(
    (g) => g.conditions.skin_type || g.conditions.product_type
  );

  return {
    ageArticle,
    relevantArticles,
    guidelines: guidelines.slice(0, 6),
    quickTips: quickTips.slice(0, 4),
  };
}

// Get translation text from i18n
export function getTranslation(
  translations: Record<string, unknown>,
  key: string
): string {
  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

// Get categories data
export function getCategories() {
  return categoriesData.categories;
}
