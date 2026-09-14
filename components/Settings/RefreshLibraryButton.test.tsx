/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RefreshLibraryButton } from './RefreshLibraryButton';
import {
  formatVivinoLibraryRefreshDate,
  nextVivinoLibraryRefreshAt,
} from '@/lib/vivinoLibraryRefresh';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

describe('RefreshLibraryButton', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return jsonResponse({
          updated: 1,
          skipped: 0,
          failed: 0,
          nextAvailableAt: nextVivinoLibraryRefreshAt(new Date())?.toISOString(),
        });
      }
      return jsonResponse({
        onCooldown: false,
        nextAvailableAt: null,
        refreshedAt: null,
      });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('is enabled when the user has never refreshed', async () => {
    render(<RefreshLibraryButton vivinoLibraryRefreshedAt={null} />);
    expect(
      screen.getByRole('button', { name: 'Update library' })
    ).toBeEnabled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/refreshVivinoDetails');
    });
    expect(
      screen.getByRole('button', { name: 'Update library' })
    ).toBeEnabled();
  });

  it('is disabled during the 30-day cooldown and shows the next date', () => {
    const refreshedAt = new Date().toISOString();
    const nextAvailableAt = nextVivinoLibraryRefreshAt(refreshedAt);
    render(
      <RefreshLibraryButton vivinoLibraryRefreshedAt={refreshedAt} />
    );
    expect(
      screen.getByRole('button', { name: 'Update library' })
    ).toBeDisabled();
    expect(
      screen.getByText(
        `Next update available on ${formatVivinoLibraryRefreshDate(nextAvailableAt!)}`
      )
    ).toBeInTheDocument();
  });

  it('loads the cooldown from the server when the component mounts', async () => {
    const nextAvailableAt = nextVivinoLibraryRefreshAt(new Date())!;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        onCooldown: true,
        nextAvailableAt: nextAvailableAt.toISOString(),
        refreshedAt: new Date().toISOString(),
      }),
    }) as unknown as typeof fetch;

    render(<RefreshLibraryButton vivinoLibraryRefreshedAt={null} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Update library' })
      ).toBeDisabled();
    });
    expect(
      screen.getByText(
        `Next update available on ${formatVivinoLibraryRefreshDate(nextAvailableAt)}`
      )
    ).toBeInTheDocument();
  });

  it('disables immediately on click and shows when it is available again', async () => {
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return new Promise(() => {
          /* hang so we can assert the optimistic lock */
        });
      }
      return jsonResponse({
        onCooldown: false,
        nextAvailableAt: null,
        refreshedAt: null,
      });
    }) as unknown as typeof fetch;

    render(<RefreshLibraryButton vivinoLibraryRefreshedAt={null} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/refreshVivinoDetails');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update library' }));

    expect(
      screen.getByRole('button', { name: 'Update library' })
    ).toBeDisabled();
    expect(
      screen.getByText(
        `Next update available on ${formatVivinoLibraryRefreshDate(
          nextVivinoLibraryRefreshAt(new Date())!
        )}`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Available once every 30 days.')
    ).not.toBeInTheDocument();
  });

  it('stays disabled after the request finishes', async () => {
    render(<RefreshLibraryButton vivinoLibraryRefreshedAt={null} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/refreshVivinoDetails');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update library' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Update library' })
      ).toBeDisabled();
    });
    expect(screen.getByText(/Next update available on /)).toBeInTheDocument();
  });
});
