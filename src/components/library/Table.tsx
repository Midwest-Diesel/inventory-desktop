import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import { ReactNode } from "react";

interface Props extends TableHTML {
  children: ReactNode
  variant?: ('plain' | 'row-details' | 'edit-row-details' | 'fit')[]
}


export default function Table({ children, className = '', variant = [], ...props }: Props) {
  const classes = generateClasses(className, variant, 'table');

  return (
    <table
      {...parseClasses(classes)}
      {...props}  
    >
      { children }
    </table>
  );
}
