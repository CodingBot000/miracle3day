/**
 * 첫 글자를 대문자로 변환하고 나머지 글자는 소문자로 변환하는 함수
 * @param {string} str - 변환할 문자열
 * @return {string} - 변환된 문자열
 */
export const capitalizeWord = (str: string) => {
  if (!str) return ""; // 빈 문자열에 대한 처리
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
