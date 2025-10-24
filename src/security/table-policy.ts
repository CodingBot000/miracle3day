// 개발 속도용 옵션 (dev에서만 모든 키 허용할지 여부)
export const ALLOW_ALL_IN_DEV = false;

// 전역 블랙리스트 (추가로 막고 싶은 키, 필요시만)
export const BLACKLIST_GLOBAL = [
  // "internal_note",
];

// 테이블별 추가 블랙리스트 (없으면 생략)
export const extraBlacklist: Record<string, string[]> = {
  // "hospital": ["sensitive_flag"],
};

// 테이블별 허용 컬럼 제한(있으면 이것만 허용; 최우선)
export const allowList: Record<string, string[]> = {
  // "members": ["nickname", "avatar_url"],
};
