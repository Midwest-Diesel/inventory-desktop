import { useNavState } from "../../hooks/useNavState";
import { CSSProperties, ReactNode, useRef } from "react";

interface Props {
  children: ReactNode
  href: string
  style?: CSSProperties
  className?: string
  tabName?: string
}


export default function Link({ children, href, style, className, tabName, ...props }: Props) {
  const { push, newTab } = useNavState();
  const ref = useRef<HTMLAnchorElement>(null);

  const handleChangePage = () => {
    if (!ref.current || location.pathname === href) return;
    push(tabName || ref.current.textContent || 'Home', href);
  };

  
  return (
    <a
      ref={ref}
      href="#"
      data-href={href}
      onClick={(e) => {
        e.preventDefault();
        handleChangePage();
      }}
      onMouseDown={e => {
        if (e.button === 1) {
          e.preventDefault();
          e.stopPropagation();
          const name = tabName ? tabName : (e.currentTarget.textContent ?? '');
          newTab([{ name, url: href }], false);
        }
      }}
      style={style}
      className={className}
      {...props}
    >
      { children }
    </a>
  );
}
