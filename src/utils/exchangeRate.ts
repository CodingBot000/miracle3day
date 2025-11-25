// src/utils/exchangeRate.ts

export async function getKRWtoUSD(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=KRW&symbols=USD",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: {
      amount: number;
      base: string;
      date: string;
      rates: { USD: number };
    } = await response.json();

    // 환율 값 반환 (1 KRW → USD)
    return data.rates.USD;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return null;
  }
}

// // 사용 예시
// (async () => {
//   const rate = await getKRWtoUSD();
//   log.debug("1 KRW =", rate, "USD");
// })();
