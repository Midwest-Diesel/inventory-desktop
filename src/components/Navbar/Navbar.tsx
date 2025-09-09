import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";
import Button from "../Library/Button";
import { useNavState } from "../../hooks/useNavState";
import ContextMenu from "../Library/ContextMenu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavTab from "./NavTab";


export default function Navbar() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const { tabs, setTabs, forward, backward, handleChangeTab, newTab } = useNavState();
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

  const handleDeleteTab = async (id: number) => {
    if (tabs.length === 1) return;
    const filteredTabs = tabs.filter((t) => t.id !== id);
    let updatedTabs = filteredTabs;
    if (tabs.find((t) => t.selected)?.id === id) {
      const newTab = filteredTabs[filteredTabs.length - 1];
      navigate(newTab.history[newTab.history.length - 1].url, { replace: true });
      updatedTabs = updatedTabs.map((tab) => {
        if (tab.id === newTab.id) {
          return { ...tab, selected: true };
        }
        return tab;
      });
    }
    setTabs(updatedTabs);
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
            <Button onClick={backward}>&lt;</Button>
            <Button onClick={forward}>&gt;</Button>
          </div>

          {tabs.map((tab: Tab) => {
            return (
              <NavTab
                key={tab.id}
                tab={tab}
                handleChangeTab={handleChangeTab}
                handleDeleteTab={handleDeleteTab}
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
