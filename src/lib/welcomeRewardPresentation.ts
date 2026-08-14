export function getWelcomeRewardProgress(
  eligibleSubtotal: number,
  minimumSubtotal = 5_000
) {
  const current = Math.max(0, Number.isFinite(eligibleSubtotal) ? eligibleSubtotal : 0);
  const target = Math.max(0, Number.isFinite(minimumSubtotal) ? minimumSubtotal : 0);
  const remaining = Math.max(0, target - current);
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 100;

  return { current, target, remaining, percentage };
}
