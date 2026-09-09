import { nodeHttpsFetch } from './nodeHttpsFetch';

export const vivinoFetch = (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  const nextInit: RequestInit = { cache: 'no-store', ...init };
  if (process.env.JEST_WORKER_ID) {
    return fetch(input, nextInit);
  }
  return nodeHttpsFetch(input, nextInit);
};
