type Options = {
  interval: number; // 시간 윈도우 (ms)
  uniqueTokenPerInterval?: number; // 최대 추적 가능한 고유 토큰 수
};

export default function rateLimit(options: Options) {
  const tokenCache = new Map<string, number[]>();

  // 주기적으로 오래된 항목 정리 (메모리 누수 방지)
  setInterval(() => {
    const now = Date.now();
    tokenCache.forEach((value, key) => {
      const validTimestamps = value.filter(
        (timestamp: number) => timestamp > now - options.interval
      );
      if (validTimestamps.length === 0) {
        tokenCache.delete(key);
      } else {
        tokenCache.set(key, validTimestamps);
      }
    });
  }, options.interval);

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const timestamps = tokenCache.get(token) || [];

        // 윈도우 내의 유효한 타임스탬프만 필터링
        const validTimestamps = timestamps.filter(
          (timestamp: number) => timestamp > now - options.interval
        );

        if (validTimestamps.length >= limit) {
          reject(new Error('Rate limit exceeded'));
        } else {
          validTimestamps.push(now);
          tokenCache.set(token, validTimestamps);
          resolve();
        }
      }),
  };
}
