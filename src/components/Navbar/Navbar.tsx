import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";
import Button from "../Library/Button";


export default function Navbar() {
  const [user] = useAtom<User>(userAtom);

  return (
    <nav className="navbar">
      { user.type === 'office' && <OfficeNavbar /> }
      { user.type === 'shop' && <ShopNavbar /> }

      <div className="nav-buttons">
        <Button onClick={() => window.history.back()}>&lt;</Button>
        <Button onClick={() => window.history.forward()}>&gt;</Button>
      </div>
    </nav>
  );
}
