import {
  BASIC_TEMPLATE,
  INTERMEDIATE_TEMPLATE,
  ADVANCED_TEMPLATE,
  StepTemplate
} from './routineTemplates';
import { customizeMiddayRoutine } from './middayRoutineLogic';

export interface GeneratedRoutine {
  type: 'basic' | 'intermediate' | 'advanced';
  morning: StepTemplate[];
  midday: StepTemplate[];
  evening: StepTemplate[];
}

export interface UserProfile {
  skin_type?: string;
  fitzpatrick_type?: number;
  work_environment?: string;
  country_code?: string;
  region?: string;
  skin_concerns?: string[];
  primary_goal?: string;
  age_group?: string;
  climate?: {
    temperature: number;
    humidity: number;
    uv_index: number;
  };
}

export async function generateRoutine(
  userProfile: UserProfile,
  routineType: string
): Promise<GeneratedRoutine> {
  let template;
  switch (routineType) {
    case 'basic':
      template = BASIC_TEMPLATE;
      break;
    case 'intermediate':
      template = INTERMEDIATE_TEMPLATE;
      break;
    case 'advanced':
      template = ADVANCED_TEMPLATE;
      break;
    default:
      template = INTERMEDIATE_TEMPLATE;
  }

  // Deep copy the template
  const routine: GeneratedRoutine = JSON.parse(JSON.stringify(template));

  // Customize each time of day
  routine.morning = customizeMorningRoutine(routine.morning, userProfile);
  routine.midday = customizeMiddayRoutine(
    routine.midday,
    {
      skin_type: userProfile.skin_type || 'normal',
      fitzpatrick_type: userProfile.fitzpatrick_type || 3,
      work_environment: userProfile.work_environment || 'indoor',
      country_code: userProfile.country_code || 'US',
      region: userProfile.region,
      skin_concerns: userProfile.skin_concerns,
      climate: userProfile.climate
    },
    routineType as 'basic' | 'intermediate' | 'advanced'
  );
  routine.evening = customizeEveningRoutine(routine.evening, userProfile);

  return routine;
}

function customizeMorningRoutine(morning: StepTemplate[], userProfile: UserProfile): StepTemplate[] {
  const steps = [...morning];

  // Customize based on skin type
  if (userProfile.skin_type === 'oily') {
    const moisturizerStep = steps.find(s => s.step_type === 'moisturizer');
    if (moisturizerStep) {
      moisturizerStep.step_name = 'Oil-Free Lightweight Moisturizer';
      moisturizerStep.recommended_ingredients = ['niacinamide', 'hyaluronic_acid'];
      moisturizerStep.recommendation_reason = 'Lightweight hydration for oily skin';
    }
  } else if (userProfile.skin_type === 'dry') {
    const moisturizerStep = steps.find(s => s.step_type === 'moisturizer');
    if (moisturizerStep) {
      moisturizerStep.step_name = 'Rich Hydrating Cream';
      moisturizerStep.recommended_ingredients = ['ceramide', 'squalane', 'shea_butter'];
      moisturizerStep.recommendation_reason = 'Deep hydration for dry skin';
    }
  }

  // Customize based on skin concerns
  if (userProfile.skin_concerns?.includes('acne') || userProfile.skin_concerns?.includes('pimples')) {
    const serumStep = steps.find(s => s.step_type === 'serum');
    if (serumStep) {
      serumStep.recommended_ingredients = ['niacinamide', 'salicylic_acid'];
      serumStep.recommendation_reason = 'Target acne and breakouts';
    }
  }

  if (userProfile.skin_concerns?.includes('dark_spots') || userProfile.skin_concerns?.includes('hyperpigmentation')) {
    const serumStep = steps.find(s => s.step_type === 'serum');
    if (serumStep) {
      serumStep.recommended_ingredients = ['vitamin_c', 'arbutin', 'niacinamide'];
      serumStep.recommendation_reason = 'Brighten and even skin tone';
    }
  }

  // Customize sunscreen based on Fitzpatrick type
  const sunscreenStep = steps.find(s => s.step_type === 'sunscreen');
  if (sunscreenStep && userProfile.fitzpatrick_type) {
    if (userProfile.fitzpatrick_type <= 2) {
      sunscreenStep.step_name = 'SPF 50+ PA++++ Broad Spectrum Sunscreen';
      sunscreenStep.recommendation_reason = 'Maximum protection for fair skin - reapply every 2 hours';
    } else if (userProfile.fitzpatrick_type >= 5) {
      sunscreenStep.step_name = 'SPF 30+ PA+++ Sunscreen';
      sunscreenStep.recommendation_reason = 'Prevent hyperpigmentation and sun damage';
    }
  }

  return steps;
}

function customizeEveningRoutine(evening: StepTemplate[], userProfile: UserProfile): StepTemplate[] {
  const steps = [...evening];

  // Customize based on age group and skin concerns
  if (userProfile.age_group === '40s' || userProfile.age_group === '50s+' ||
      userProfile.skin_concerns?.includes('fine_lines') ||
      userProfile.skin_concerns?.includes('wrinkles')) {
    const serumStep = steps.find(s => s.step_type === 'serum');
    if (serumStep) {
      serumStep.recommended_ingredients = ['retinol', 'peptides', 'hyaluronic_acid'];
      serumStep.recommendation_reason = 'Anti-aging treatment for mature skin';
    }
  }

  // Customize based on skin type
  if (userProfile.skin_type === 'dry') {
    const moisturizerStep = steps.find(s => s.step_type === 'moisturizer');
    if (moisturizerStep) {
      moisturizerStep.step_name = 'Rich Restorative Night Cream';
      moisturizerStep.recommended_ingredients = ['ceramide', 'squalane', 'shea_butter'];
      moisturizerStep.recommendation_reason = 'Intensive overnight hydration';
    }
  }

  // Add recommendation for primary goal
  if (userProfile.primary_goal === 'anti_aging') {
    const treatmentStep = steps.find(s => s.step_type === 'treatment');
    if (treatmentStep) {
      treatmentStep.recommended_ingredients = ['retinol', 'peptides'];
      treatmentStep.recommendation_reason = 'Stimulate collagen production';
    }
  } else if (userProfile.primary_goal === 'hydration') {
    const serumStep = steps.find(s => s.step_type === 'serum');
    if (serumStep) {
      serumStep.recommended_ingredients = ['hyaluronic_acid', 'ceramide', 'squalane'];
      serumStep.recommendation_reason = 'Deep hydration treatment';
    }
  } else if (userProfile.primary_goal === 'brightening') {
    const serumStep = steps.find(s => s.step_type === 'serum');
    if (serumStep) {
      serumStep.recommended_ingredients = ['niacinamide', 'arbutin', 'tranexamic_acid'];
      serumStep.recommendation_reason = 'Brighten and even skin tone overnight';
    }
  }

  return steps;
}
