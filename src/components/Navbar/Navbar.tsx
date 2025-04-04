import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";
import Button from "../Library/Button";
import { useNavState } from "./useNavState";
import ContextMenu from "../Library/ContextMenu";
import { useEffect, useState } from "react";
// import { changeSelectedTab, deleteTab, renameTab } from "@/scripts/controllers/tabsController";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const { tabs, setTabs, forward, backward, handleChangeTab, newTab } = useNavState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(null);
  let loaded = false;

  // useEffect(() => {
  //   if (tabs.length === 0 || loaded) return;
  //   loaded = true;
  //   const tab = tabs.find((t) => t.selected);
  //   router.replace(tab.history[tab.history.length - 1].url);
  // }, [tabs]);

  const handleRenameTab = async () => {
    const name = prompt('Name');
    // await renameTab(selectedTab.id, name);
    setTabs(tabs.map((tab) => {
      if (tab.id === selectedTab.id) {
        return { ...tab, name };
      }
      return tab;
    }));
  };

  const handleDeleteTab = async () => {
    if (tabs.length === 1) return;
    const filteredTabs = tabs.filter((t) => t.id !== selectedTab.id);
    let updatedTabs = filteredTabs;
    if (selectedTab.selected) {
      const newTab = filteredTabs[filteredTabs.length - 1];
      // await changeSelectedTab(newTab.id);
      router.replace(newTab.history[newTab.history.length - 1].url);
      updatedTabs = updatedTabs.map((tab) => {
        if (tab.id === newTab.id) {
          return { ...tab, selected: true };
        }
        return tab;
      });
    }
    // await deleteTab(selectedTab.id);
    setTabs(updatedTabs);
  };


  return (
    <>
      <ContextMenu
        open={menuOpen}
        setOpen={setMenuOpen}
        targetClass="navbar-tab"
        notTargetClass="navbar-tab--new-tab"
        list={[
          { name: 'Rename', fn: handleRenameTab },
          { name: 'Close', fn: handleDeleteTab }
        ]}
      />

      <div className="navbar-tab__container">
        <div className="nav-buttons">
          <Button onClick={backward}>&lt;</Button>
          <Button onClick={forward}>&gt;</Button>
        </div>

        {tabs.map((tab) => {
          return (
            <Button
              key={tab.id}
              style={tab.selected ? { borderBottom: '2px solid var(--yellow-2)' } : {}}
              variant={["no-style"]}
              className="navbar-tab"
              onClick={() => handleChangeTab(tab.id)}
              onContextMenu={() => setSelectedTab(tab)}
            >
              { tab.name || tab.history[tab.urlIndex].name }
            </Button>
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
        {user.type === "office" && <OfficeNavbar />}
        {user.type === "shop" && <ShopNavbar />}
      </nav>
    </>
  );
}
