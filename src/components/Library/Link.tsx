import { useNavState } from "../../hooks/useNavState";
import { useRef } from "react";

interface Props {
  children: any
  href: string
  style?: any
  className?: string
}


export default function Link({ children, href, style, className, ...props }: Props) {
  const { push, newTab } = useNavState();
  const ref = useRef<HTMLAnchorElement>(null);

  const handleChangePage = () => {
    if (!ref.current || location.pathname === href) return;
    push(ref.current.textContent || 'Home', href);
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
          newTab([{ name: e.currentTarget.textContent ?? '', url: href }], false);
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
