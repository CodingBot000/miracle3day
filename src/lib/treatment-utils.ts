import type { TreatmentRoot, TreatmentAttributes } from '@/app/models/treatmentData.dto';

/**
 * Helper utilities for safely accessing TreatmentRoot JSONB attributes
 * after schema migration from generated columns to pure JSONB structure
 */

/**
 * Safely extracts cost from treatment attributes
 */
export function getTreatmentCost(treatment: TreatmentRoot): number {
  return treatment.attributes?.cost?.from ?? 0;
}

/**
 * Safely extracts cost currency
 */
export function getCostCurrency(treatment: TreatmentRoot): string {
  return treatment.attributes?.cost?.currency ?? 'KRW';
}

/**
 * Safely extracts pain level
 */
export function getPainLevel(treatment: TreatmentRoot): string {
  return treatment.attributes?.pain?.level ?? 'medium';
}

/**
 * Safely extracts pain score (0-10)
 */
export function getPainScore(treatment: TreatmentRoot): number {
  return treatment.attributes?.pain?.pain_score_0_10 ?? 5;
}

/**
 * Safely extracts effect onset weeks minimum
 */
export function getEffectOnsetWeeksMin(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.effect?.onset_weeks_min;
}

/**
 * Safely extracts effect onset weeks maximum
 */
export function getEffectOnsetWeeksMax(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.effect?.onset_weeks_max;
}

/**
 * Safely extracts duration months minimum
 */
export function getDurationMonthsMin(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.effect?.duration_months_min;
}

/**
 * Safely extracts duration months maximum
 */
export function getDurationMonthsMax(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.effect?.duration_months_max;
}

/**
 * Gets duration range as string
 */
export function getDurationRange(treatment: TreatmentRoot): string {
  const min = getDurationMonthsMin(treatment);
  const max = getDurationMonthsMax(treatment);

  if (!min && !max) return 'N/A';
  if (min === max) return `${min} months`;
  return `${min ?? 0}-${max ?? 0} months`;
}

/**
 * Safely extracts recommended sessions minimum
 */
export function getRecSessionsMin(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.recommended?.sessions_min;
}

/**
 * Safely extracts recommended sessions maximum
 */
export function getRecSessionsMax(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.recommended?.sessions_max;
}

/**
 * Safely extracts recommended interval weeks
 */
export function getRecIntervalWeeks(treatment: TreatmentRoot): number | undefined {
  return treatment.attributes?.recommended?.interval_weeks;
}

/**
 * Gets recommended sessions range
 */
export function getSessionsRange(treatment: TreatmentRoot): string {
  const min = getRecSessionsMin(treatment);
  const max = getRecSessionsMax(treatment);

  if (!min && !max) return 'N/A';
  if (min === max) return `${min} session${min && min > 1 ? 's' : ''}`;
  return `${min ?? 1}-${max ?? 1} sessions`;
}

/**
 * Checks if optional field exists
 */
export function hasOptionalField(
  treatment: TreatmentRoot,
  field: keyof TreatmentAttributes
): boolean {
  return treatment.attributes?.[field] !== undefined;
}

/**
 * Gets all available optional fields
 */
export function getAvailableOptionalFields(
  treatment: TreatmentRoot
): string[] {
  const optionalFields = [
    'advantage',
    'disadvantage',
    'main_ingredients',
    'additional_info',
    'special_equipment',
    'contraindications'
  ];

  return optionalFields.filter(field =>
    hasOptionalField(treatment, field as keyof TreatmentAttributes)
  );
}

/**
 * Formats price in KRW
 */
export function formatPrice(amount: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats treatment cost with currency
 */
export function formatTreatmentCost(treatment: TreatmentRoot): string {
  const cost = getTreatmentCost(treatment);
  const currency = getCostCurrency(treatment);
  return formatPrice(cost, currency);
}