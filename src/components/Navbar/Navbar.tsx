import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";


export default function Navbar() {
  const [user] = useAtom<User>(userAtom);

  return (
    <nav className="navbar">
      { user.type === 'office' && <OfficeNavbar /> }
      { user.type === 'shop' && <ShopNavbar /> }
    </nav>
  );
}
