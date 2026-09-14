export const VIVINO_LIBRARY_REFRESH_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export const nextVivinoLibraryRefreshAt = (
  refreshedAt?: Date | string | null,
  cooldownMs = VIVINO_LIBRARY_REFRESH_COOLDOWN_MS
): Date | null => {
  if (refreshedAt == null) return null;
  const time = new Date(refreshedAt).getTime();
  if (!Number.isFinite(time)) return null;
  return new Date(time + cooldownMs);
};

export const isVivinoLibraryRefreshOnCooldown = (
  refreshedAt?: Date | string | null,
  now: Date = new Date(),
  cooldownMs = VIVINO_LIBRARY_REFRESH_COOLDOWN_MS
) => {
  const nextAvailableAt = nextVivinoLibraryRefreshAt(refreshedAt, cooldownMs);
  if (!nextAvailableAt) return false;
  return now.getTime() < nextAvailableAt.getTime();
};

export const formatVivinoLibraryRefreshDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
