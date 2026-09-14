/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RefreshLibraryButton } from './RefreshLibraryButton';
import {
  formatVivinoLibraryRefreshDate,
  nextVivinoLibraryRefreshAt,
} from '@/lib/vivinoLibraryRefresh';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe('RefreshLibraryButton', () => {
  it('is enabled when the user has never refreshed', () => {
    render(<RefreshLibraryButton vivinoLibraryRefreshedAt={null} />);
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
});
