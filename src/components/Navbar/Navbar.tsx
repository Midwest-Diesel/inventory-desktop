import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";
import Button from "../library/Button";
import { useNavState } from "../../hooks/useNavState";
import ContextMenu from "../library/ContextMenu";
import { useState } from "react";
import NavTab from "./NavTab";


export default function Navbar() {
  const [user] = useAtom(userAtom);
  const { tabs, setTabs, forward, backward, handleChangeTab, newTab, deleteTab } = useNavState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);

  const handleRenameTab = async () => {
    const name = prompt('Name');
    setTabs(tabs.map((tab) => {
      if (tab.id === selectedTab?.id) {
        return { ...tab, name };
      }
      return tab;
    }));
  };


  return (
    user.id &&
      <>
        <ContextMenu
          open={menuOpen}
          setOpen={setMenuOpen}
          targetClass="navbar-tab__content"
          notTargetClass="navbar-tab--new-tab"
          list={[
            { name: 'Rename', fn: handleRenameTab }
          ]}
        />

        <div className="navbar-tab__container">
          <div className="nav-buttons">
            <Button id="nav-buttons__back" onClick={backward}>&lt;</Button>
            <Button id="nav-buttons__foward" onClick={forward}>&gt;</Button>
          </div>

          {tabs.map((tab: Tab) => {
            return (
              <NavTab
                key={tab.id}
                tab={tab}
                handleChangeTab={handleChangeTab}
                handleDeleteTab={deleteTab}
                setSelectedTab={setSelectedTab}
                closeBtnActive={tabs.length > 1}
              />
            );
          })}

          <Button
            variant={["no-style"]}
            className="navbar-tab navbar-tab--new-tab"
            onClick={() => newTab()}
          >
            +
          </Button>
        </div>

        <nav className="navbar">
          {user.type === "office" && <OfficeNavbar user={user} />}
          {user.type === "shop" && <ShopNavbar />}
        </nav>
      </>
  );
}
