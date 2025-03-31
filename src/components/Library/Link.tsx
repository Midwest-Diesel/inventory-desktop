import { default as NavLink } from "next/link";
import { useNavState } from "../Navbar/useNavState";
import { cap } from "@/scripts/tools/stringUtils";

interface Props {
  children: any
  href: string
  style?: any
  className?: string
}


export default function Link({ children, href, style, className, ...props }: Props) {
  const { push } = useNavState();

  const handleChangePage = () => {
    if (location.pathname === href) return;
    const path = href.split('/');
    push(cap(path[path.length - 1]) || 'Home', href);
  };

  
  return (
    <NavLink
      href="#"
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
