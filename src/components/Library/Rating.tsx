import { CSSProperties, useState } from "react";

interface Props {
  style?: CSSProperties
  amount?: number
  onChange?: (position: number) => void
  value?: number
  disabled?: boolean
}


export default function Rating({ style, amount = 5, onChange, value = 0, disabled = false }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState(0);


  return (
    <div className="rating-container" style={style}>
      {Array.from({ length: amount }).map((_, i) => {
        const isFilled = i + 1 <= value;
        const isHovered = hoveredIndex > 0 && hoveredIndex >= i && !isFilled;
        const icon = () => {
          if (isHovered) return 'outline';
          return isFilled ? 'filled' : 'empty';
        };

        return (
          <img
            key={i}
            src={`/images/icons/star-${icon()}.svg`}
            onClick={() => !disabled && onChange?.(i + 1)}
            onMouseEnter={() => !disabled && setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(0)}
          />
        );
      })}
    </div>
  );
}
