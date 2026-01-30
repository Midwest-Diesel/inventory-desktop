import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props {
  variant?: ('no-style' | 'low-opacity-bg' | 'sub-table-item')[]
  children: React.ReactNode
  className?: string
  colSpan?: number
}


export default function GridItem({ children, className = '', colSpan, variant = [] }: Props) {
  const classes = generateClasses(className, variant, 'grid__item');
  

  return (
    <div {...parseClasses(classes)} style={colSpan ? { gridColumn: `span ${colSpan}` } : {}}>
      { children }
    </div>
  );
}
