/**
 * 국가별 반구 분류
 * - north: 북반구 (여름: 6-8월)
 * - south: 남반구 (여름: 12-2월)
 * - equatorial: 적도 지역 (연중 UV 높음)
 */
export const COUNTRY_HEMISPHERE: Record<string, 'north' | 'south' | 'equatorial'> = {
  // 북반구 - 아시아
  'KR': 'north', 'JP': 'north', 'CN': 'north', 'TW': 'north',
  'MN': 'north', 'KZ': 'north', 'UZ': 'north', 'KG': 'north',
  'TJ': 'north', 'TM': 'north', 'AF': 'north', 'PK': 'north',
  'IN': 'north', 'NP': 'north', 'BT': 'north', 'BD': 'north',
  'LK': 'north', 'MM': 'north', 'TH': 'north', 'LA': 'north',
  'VN': 'north', 'KH': 'north', 'PH': 'north',

  // 북반구 - 유럽
  'GB': 'north', 'IE': 'north', 'FR': 'north', 'ES': 'north',
  'PT': 'north', 'IT': 'north', 'DE': 'north', 'NL': 'north',
  'BE': 'north', 'LU': 'north', 'CH': 'north', 'AT': 'north',
  'PL': 'north', 'CZ': 'north', 'SK': 'north', 'HU': 'north',
  'RO': 'north', 'BG': 'north', 'GR': 'north', 'TR': 'north',
  'RU': 'north', 'UA': 'north', 'BY': 'north', 'LT': 'north',
  'LV': 'north', 'EE': 'north', 'FI': 'north', 'SE': 'north',
  'NO': 'north', 'DK': 'north', 'IS': 'north',

  // 북반구 - 북미
  'US': 'north', 'CA': 'north', 'MX': 'north',

  // 북반구 - 중동
  'SA': 'north', 'AE': 'north', 'QA': 'north', 'KW': 'north',
  'BH': 'north', 'OM': 'north', 'YE': 'north', 'JO': 'north',
  'LB': 'north', 'SY': 'north', 'IQ': 'north', 'IR': 'north',
  'IL': 'north', 'PS': 'north',

  // 북반구 - 북아프리카
  'EG': 'north', 'LY': 'north', 'TN': 'north', 'DZ': 'north',
  'MA': 'north', 'MR': 'north', 'ML': 'north', 'NE': 'north',
  'TD': 'north', 'SD': 'north', 'ER': 'north', 'DJ': 'north',
  'SO': 'north', 'ET': 'north',

  // 남반구 - 오세아니아
  'AU': 'south', 'NZ': 'south', 'FJ': 'south', 'PG': 'south',
  'SB': 'south', 'VU': 'south', 'NC': 'south', 'WS': 'south',
  'TO': 'south',

  // 남반구 - 남미
  'BR': 'south', 'AR': 'south', 'CL': 'south', 'UY': 'south',
  'PY': 'south', 'BO': 'south', 'PE': 'south',

  // 남반구 - 아프리카
  'ZA': 'south', 'ZW': 'south', 'BW': 'south', 'NA': 'south',
  'ZM': 'south', 'AO': 'south', 'MZ': 'south', 'MW': 'south',
  'MG': 'south', 'LS': 'south', 'SZ': 'south',

  // 적도 지역 - 아시아
  'SG': 'equatorial', 'MY': 'equatorial', 'BN': 'equatorial',
  'ID': 'equatorial', 'TL': 'equatorial',

  // 적도 지역 - 아프리카
  'KE': 'equatorial', 'UG': 'equatorial', 'TZ': 'equatorial',
  'RW': 'equatorial', 'BI': 'equatorial', 'CG': 'equatorial',
  'CD': 'equatorial', 'GA': 'equatorial', 'CM': 'equatorial',
  'GQ': 'equatorial', 'ST': 'equatorial', 'GH': 'equatorial',
  'CI': 'equatorial', 'BJ': 'equatorial', 'TG': 'equatorial',
  'NG': 'equatorial', 'SL': 'equatorial', 'LR': 'equatorial',
  'GN': 'equatorial', 'GW': 'equatorial', 'GM': 'equatorial',
  'SN': 'equatorial',

  // 적도 지역 - 남미
  'EC': 'equatorial', 'CO': 'equatorial', 'GY': 'equatorial',
  'SR': 'equatorial', 'GF': 'equatorial', 'VE': 'equatorial',
};

export const DEFAULT_HEMISPHERE = 'north';

export type Hemisphere = 'north' | 'south' | 'equatorial';

export function getHemisphere(countryCode: string): Hemisphere {
  if (!countryCode) return DEFAULT_HEMISPHERE;
  return COUNTRY_HEMISPHERE[countryCode.toUpperCase()] || DEFAULT_HEMISPHERE;
}
