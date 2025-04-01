import { default as NavLink } from "next/link";
import { useNavState } from "../Navbar/useNavState";
import { useRef } from "react";

interface Props {
  children: any
  href: string
  style?: any
  className?: string
}


export default function Link({ children, href, style, className, ...props }: Props) {
  const { push } = useNavState();
  const ref = useRef<HTMLAnchorElement>(null);

  const handleChangePage = () => {
    if (location.pathname === href) return;
    push(ref.current.textContent || 'Home', href);
  };

  
  return (
    <NavLink
      ref={ref}
      href="#"
      data-href={href}
      onClick={(e) => {
        e.preventDefault();
        handleChangePage();
      }}
      style={style}
      className={className}
      {...props}
    >
      { children }
    </NavLink>
  );
}
