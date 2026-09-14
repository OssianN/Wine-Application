import {
  formatVivinoLibraryRefreshDate,
  isVivinoLibraryRefreshOnCooldown,
  nextVivinoLibraryRefreshAt,
  VIVINO_LIBRARY_REFRESH_COOLDOWN_MS,
} from './vivinoLibraryRefresh';

describe('vivino library refresh cooldown', () => {
  const now = new Date('2026-09-14T12:00:00.000Z');

  it('allows a refresh when the user has never refreshed', () => {
    expect(isVivinoLibraryRefreshOnCooldown(null, now)).toBe(false);
    expect(isVivinoLibraryRefreshOnCooldown(undefined, now)).toBe(false);
    expect(nextVivinoLibraryRefreshAt(null)).toBeNull();
  });

  it('blocks a refresh within 30 days of the last press', () => {
    expect(isVivinoLibraryRefreshOnCooldown(now, now)).toBe(true);
    expect(
      isVivinoLibraryRefreshOnCooldown(
        new Date(now.getTime() - VIVINO_LIBRARY_REFRESH_COOLDOWN_MS + 1),
        now
      )
    ).toBe(true);
  });

  it('allows a refresh once 30 days have passed', () => {
    const refreshedAt = new Date(now.getTime() - VIVINO_LIBRARY_REFRESH_COOLDOWN_MS);
    expect(isVivinoLibraryRefreshOnCooldown(refreshedAt, now)).toBe(false);
    expect(nextVivinoLibraryRefreshAt(refreshedAt)?.toISOString()).toBe(
      now.toISOString()
    );
  });

  it('formats the next available date', () => {
    expect(formatVivinoLibraryRefreshDate('2026-10-14T12:00:00.000Z')).toBe(
      '14 Oct 2026'
    );
  });
});
