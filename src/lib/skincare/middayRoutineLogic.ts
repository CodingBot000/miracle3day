import { StepTemplate } from './routineTemplates';

interface UserProfile {
  skin_type: string;
  fitzpatrick_type: number;
  work_environment: string;
  country_code: string;
  region?: string;
  skin_concerns?: string[];
  climate?: {
    humidity: number;
    uv_index: number;
  };
}

export function customizeMiddayRoutine(
  baseMidday: StepTemplate[],
  userProfile: UserProfile,
  routineType: 'basic' | 'intermediate' | 'advanced'
): StepTemplate[] {
  const midday = JSON.parse(JSON.stringify(baseMidday));

  // 1. Sunscreen customization based on Fitzpatrick type and climate
  const sunscreenStep = midday.find((s: StepTemplate) => s.step_type === 'sunscreen');

  if (sunscreenStep) {
    if (userProfile.fitzpatrick_type <= 2) {
      sunscreenStep.step_name = 'Ultra Protection Cushion SPF 50+';
      sunscreenStep.recommendation_reason = 'Very fair skin - Critical to reapply every 2 hours';
      sunscreenStep.recommended_ingredients = ['zinc_oxide', 'titanium_dioxide'];
    } else if (userProfile.fitzpatrick_type >= 5) {
      sunscreenStep.step_name = 'SPF 30+ Sunscreen';
      sunscreenStep.recommendation_reason = 'Prevent hyperpigmentation - SPF 30+ recommended';
    }

    if (userProfile.climate?.uv_index && userProfile.climate.uv_index >= 8) {
      sunscreenStep.recommendation_reason += ` - Extreme UV (${userProfile.climate.uv_index})`;
    }

    if (userProfile.work_environment === 'outdoor') {
      sunscreenStep.recommendation_reason += ' - Outdoor work requires frequent reapplication';
    }
  }

  // 2. Oil control for oily skin (Intermediate, Advanced)
  if (routineType !== 'basic' && userProfile.skin_type === 'oily') {
    const hasBlotting = midday.some((s: StepTemplate) => s.step_type === 'blotting_paper');

    if (!hasBlotting) {
      midday.unshift({
        step_order: 1,
        step_type: 'blotting_paper',
        step_name: 'Oil Blotting Paper',
        required: false,
        recommendation_reason: 'Oily skin produces most sebum at midday'
      });
      midday.forEach((step: StepTemplate, idx: number) => {
        step.step_order = idx + 1;
      });
    }
  }

  // 3. Hydrating mist for dry environments (Intermediate, Advanced)
  if (routineType !== 'basic') {
    const needsMist =
      (userProfile.climate?.humidity && userProfile.climate.humidity < 40) ||
      userProfile.work_environment === 'indoor';

    if (needsMist) {
      const hasMist = midday.some((s: StepTemplate) => s.step_type === 'mist');

      if (!hasMist) {
        const sunscreenIdx = midday.findIndex((s: StepTemplate) => s.step_type === 'sunscreen');

        midday.splice(sunscreenIdx, 0, {
          step_order: sunscreenIdx + 1,
          step_type: 'mist',
          step_name: 'Hydrating Mist',
          required: false,
          recommended_ingredients: ['hyaluronic_acid', 'aloe_vera'],
          recommendation_reason: userProfile.climate?.humidity && userProfile.climate.humidity < 40
            ? `Combat dry climate (${userProfile.climate.humidity}% humidity)`
            : 'Rehydrate in air-conditioned office'
        });

        midday.forEach((step: StepTemplate, idx: number) => {
          step.step_order = idx + 1;
        });
      }
    }
  }

  // 4. Cleansing tissue for outdoor + oily (Advanced only)
  if (routineType === 'advanced' &&
      userProfile.skin_type === 'oily' &&
      userProfile.work_environment === 'outdoor') {

    const hasCleansing = midday.some((s: StepTemplate) => s.step_type === 'cleanser');

    if (!hasCleansing) {
      midday.unshift({
        step_order: 1,
        step_type: 'cleanser',
        step_name: 'Gentle Cleansing Tissue',
        required: false,
        recommended_ingredients: ['chamomile', 'aloe_vera'],
        recommendation_reason: 'Remove sweat and outdoor pollutants'
      });

      midday.forEach((step: StepTemplate, idx: number) => {
        step.step_order = idx + 1;
      });
    }
  }

  return midday;
}
