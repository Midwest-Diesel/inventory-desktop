import { useEffect } from "react";
import { useNavState } from "./useNavState";


export default function useHotkeys() {
  const { newTab, deleteTab, tabs, selectedTab, restoreTab } = useNavState();

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [tabs]);

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.ctrlKey && !e.shiftKey) {
      switch (e.key) {
        case 't':
          handleNewTab();
          break;
        case 'w':
          handleCloseTab();
          break;
        default:
          break;
      }
    }
 
    if (e.ctrlKey && e.shiftKey) {
      switch (e.key) {
        case 'T':
          restoreTab();
          break;
        default:
          break;
      }
    }
  };


  const handleNewTab = () => {
    newTab([{ name: 'Home', url: '/' }]);
  };

  const handleCloseTab = () => {
    const tab = selectedTab();
    if (!tab || tabs.length === 1) return;
    deleteTab(tab?.id);
  };
}
