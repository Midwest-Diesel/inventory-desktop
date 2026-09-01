import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import { ReactNode } from "react";

interface Props extends ButtonHTML {
  children: ReactNode
  className?: string
  variant?: ('no-style' | 'small' | 'x-small' | 'xx-small' | 'large' | 'no-hover-color' |'hover-move' | 'search' | 'X' | 'circle' | 'center' | 'plain' | 'save' | 'blue' | 'green' | 'red-color' | 'link' | 'fit' | 'danger')[]
  type?: 'submit' | 'reset' | 'button'
}


export default function Button({ children, className = '', variant = [], type = "button", ...props }: Props) {
  const classes = generateClasses(className, variant, 'button');

  return (
    <button
      type={type}
      {...parseClasses(classes)}
      {...props}
    >
      { children }
    </button>
  );
}
