import { RequestInit } from "next/dist/server/web/spec-extension/request";

interface IFetchUtils {
  url: string;
  fetchOptions?: RequestInit;
}

export const fetchUtils = async <T>({
  url,
  fetchOptions,
}: IFetchUtils): Promise<T> => {
  try {
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("API ERROR");
    }
  }
};
