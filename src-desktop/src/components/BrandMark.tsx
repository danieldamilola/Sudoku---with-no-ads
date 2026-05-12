import brandLogo from "../../../Sudoku logo 2.jpg";

interface BrandMarkProps {
  size?: number;
  color?: string;
  title?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 28, title = 'Sudoku' }) => {
  return (
    <img
      src={brandLogo}
      alt={title}
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
};
