import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import OfficeNavbar from "./OfficeNavbar";
import ShopNavbar from "./ShopNavbar";
import Button from "../library/Button";
import { useNavState } from "../../hooks/useNavState";
import ContextMenu from "../library/ContextMenu";
import { useRef, useState } from "react";
import NavTab from "./NavTab";
import { prompt } from "../library/Prompt";


export default function Navbar() {
  const [user] = useAtom<User>(userAtom);
  const { tabs, setTabs, forward, backward, changeTab, newTab, deleteTab } = useNavState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const draggedTab = useRef<number | null>(null);
  const lastDragTarget = useRef<string | null>(null);

  const handleRenameTab = async () => {
    const name = await prompt('Name');
    setTabs(tabs.map((tab) => {
      if (tab.id === selectedTab?.id) {
        return { ...tab, name };
      }
      return tab;
    }));
  };

  const handleTabDrag = (targetId: number, clientX: number) => {
    const draggedId = draggedTab.current;
    if (draggedId === null || draggedId === targetId) return;

    const targetElement = document.querySelector<HTMLElement>(
      `.navbar-tab[data-tabid="${targetId}"]`
    );
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const insertAfter = clientX > rect.left + rect.width / 2;
    const dragTarget = `${targetId}-${insertAfter ? 'after' : 'before'}`;
    if (lastDragTarget.current === dragTarget) return;

    lastDragTarget.current = dragTarget;

    setTabs((prevTabs) => {
      const draggedIndex = prevTabs.findIndex((tab) => tab.id === draggedId);
      const targetIndex = prevTabs.findIndex((tab) => tab.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prevTabs;

      const newTabs = [...prevTabs];
      const [tab] = newTabs.splice(draggedIndex, 1);
      const newTargetIndex = newTabs.findIndex((tab) => tab.id === targetId);
      
      newTabs.splice( newTargetIndex + (insertAfter ? 1 : 0), 0, tab);
      return newTabs;
    });
  };


  if (!user.id) return null;

  return (
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

      <div
        className="navbar-tab__container"
        onPointerMove={(e) => {
          if (draggedTab.current === null) return;

          const element = document.elementFromPoint(e.clientX, e.clientY);
          const tabElement = element?.closest<HTMLElement>('.navbar-tab');
          if (!tabElement) return;

          const targetId = Number(tabElement.dataset.tabid);
          if (!targetId) return;

          handleTabDrag(targetId, e.clientX);
        }}
        onPointerUp={() => {
          draggedTab.current = null;
          lastDragTarget.current = null;
          document.body.classList.remove('tab-dragging');
        }}
        onPointerCancel={() => {
          draggedTab.current = null;
          lastDragTarget.current = null;
          document.body.classList.remove('tab-dragging');
        }}
      >
        <div className="nav-buttons">
          <Button id="nav-buttons__back" onClick={backward}>&lt;</Button>
          <Button id="nav-buttons__foward" onClick={forward}>&gt;</Button>
        </div>

        {tabs.map((tab: Tab) => {
          return (
            <NavTab
              key={tab.id}
              tab={tab}
              changeTab={changeTab}
              handleDeleteTab={deleteTab}
              setSelectedTab={setSelectedTab}
              closeBtnActive={tabs.length > 1}
              draggedTab={draggedTab}
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

        {import.meta.env.DEV &&
          <p style={{ position: 'fixed', right: '0.2rem', top: '0.2rem', backgroundColor: 'var(--purple-1)', padding: '0 0.3rem 0.1rem', borderRadius: '0.3rem' }}>
            <strong>DEVELOPMENT</strong>
          </p>
        }
      </div>

      <nav className="navbar">
        {user.type === "office" && <OfficeNavbar />}
        {user.type === "shop" && <ShopNavbar />}
      </nav>
    </>
  );
}
