import type { AppEnv } from "../env";

export function createApiClient(env: AppEnv) {
  return async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${env.STUDY_NAVIGATOR_API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.STUDY_NAVIGATOR_API_TOKEN}`,
        ...init?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  };
}
