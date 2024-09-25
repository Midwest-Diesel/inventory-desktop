import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props {
  variant?: ('no-style' | 'low-opacity-bg' | 'sub-table-item')[]
  children: React.ReactNode
  className?: string
  rowStart?: number
  colStart?: number
  rowEnd?: number
  colEnd?: number
  breakpoints?: Breakpoint[]
  style?: React.CSSProperties
}

interface Breakpoint {
  width: number
  rowStart?: number
  colStart?: number
  rowEnd?: number
  colEnd?: number
}


export default function GridItem({ children, className, rowEnd = 0, colEnd = 0, rowStart = 0, colStart = 0, variant, breakpoints, style }: Props) {
  const classes = generateClasses(className, variant, 'grid__item');

  const determineBreakpointValues = () => {
    if (breakpoints) {
      const sortedBreakpoints = breakpoints.sort((a, b) => a.width - b.width);
      sortedBreakpoints.forEach((breakpoint) => {
        if (window.innerWidth <= breakpoint.width) {
          rowStart = breakpoint.rowStart || rowStart;
          colStart = breakpoint.colStart || colStart;
          rowEnd = breakpoint.rowEnd || rowEnd;
          colEnd = breakpoint.colEnd || colEnd;
        }
      });
    }
    return { gridRowStart: rowStart, gridColumnStart: colStart, gridRowEnd: rowEnd, gridColumnEnd: colEnd, ...style };
  };

  
  return (
    <div
      {...parseClasses(classes)}
      style={determineBreakpointValues()}
    >
      { children }
    </div>
  );
}
