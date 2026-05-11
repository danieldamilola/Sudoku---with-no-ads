interface BrandMarkProps {
  size?: number;
  color?: string;
  title?: string;
}

const CELLS = [
  [20, 4],
  [10, 12],
  [30, 12],
  [20, 22],
  [10, 32],
  [30, 32],
  [20, 40],
] as const;

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 28, color = 'currentColor', title = 'Sudoku' }) => (
  <svg
    aria-label={title}
    role="img"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
  >
    {CELLS.map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1.2" fill={color} />
    ))}
  </svg>
);
