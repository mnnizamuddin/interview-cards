/**
 * A thick, rounded progress bar with a light stripe across the fill, like a game's level bar.
 * Made of spans so it can sit inside a `<summary>`. Pass `label` for screen readers; a decorative
 * bar (beside a visible percentage) omits it.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  size = 'md',
}: {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const share = Math.min(100, (value / Math.max(1, max)) * 100);
  const height = size === 'sm' ? 'h-2.5' : 'h-4';
  const a11y = label
    ? { role: 'progressbar', 'aria-label': label, 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': max }
    : { 'aria-hidden': true };
  return (
    <span className={`block ${height} overflow-hidden rounded-full bg-surface`} {...a11y}>
      <span className="relative block h-full rounded-full bg-progress transition-[width] duration-300" style={{ width: `${share}%` }}>
        {share > 4 && <span className="absolute inset-x-2 top-[22%] h-[28%] rounded-full bg-white/35" />}
      </span>
    </span>
  );
}
