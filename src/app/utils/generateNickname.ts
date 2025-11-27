
import { ADJECTIVES, NOUNS } from "@/constants/nicknaming/adjectives_nouns";

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDigits(length = 5): string {
  const max = Math.pow(10, length);
  const num = Math.floor(Math.random() * max);
  return num.toString().padStart(length, "0");
}

export function generateNickname() {
  const adjective = getRandomItem(ADJECTIVES);
  const noun = getRandomItem(NOUNS);
  const digits = generateRandomDigits(5); // 길이 변경 가능

  return `${adjective}${noun}${digits}`;
}