/**
 * @jest-environment node
 */
import vintageFixture from '@/__fixtures__/vivinoVintageResponse.json';
import { getDrinkingWindowForVintage } from './getDrinkingWindow';

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
  text: async (): Promise<string> => JSON.stringify(body),
});

describe('getDrinkingWindowForVintage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('maps the recommended drinking window from the vintage API', async () => {
    global.fetch = jest.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/api/vintages/156524504')) {
        return jsonResponse(vintageFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;

    await expect(getDrinkingWindowForVintage(156524504)).resolves.toEqual({
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2024,
      drinkingWindowStatus: 5,
    });
  });

  it('returns undefined when the vintage has no drinking window', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ vintage: { id: 1, name: 'No window' } })
    ) as unknown as typeof fetch;

    await expect(getDrinkingWindowForVintage(1)).resolves.toBeUndefined();
  });

  it('returns undefined for an invalid vintage id', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(getDrinkingWindowForVintage(0)).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
