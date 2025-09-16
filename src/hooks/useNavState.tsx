import { useAtom } from "jotai";
import { tabsAtom } from "@/scripts/atoms/state";
import { useNavigate } from "react-router-dom";
import { toAbsolutePath } from "@/scripts/tools/stringUtils";


const MAX_HISTORY = 40;

export function useNavState() {
  const navigate = useNavigate();
  const [tabs, setTabsAtom] = useAtom<Tab[]>(tabsAtom);

  const setTabs = (tabsInput: Tab[] | ((prevTabs: Tab[]) => Tab[])) => {
    const newTabs = typeof tabsInput === 'function' ? (tabsInput as (prev: Tab[]) => Tab[])(tabs) : tabsInput;
    setTabsAtom(newTabs);
    localStorage.setItem('tabs', JSON.stringify(newTabs));
  };

  const forward = async () => {
    const tab = tabs.find((t) => t.selected);
    if (!tab) return;
    if (tab.urlIndex === tab.history.length - 1) return;
    const nextTab = tab.history[tab.urlIndex + 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex + 1 }) : t));
    navigate(toAbsolutePath(nextTab.url), { replace: false });
  };

  const backward = async () => {    
    const tab = tabs.find((t) => t.selected);
    if (!tab) return;
    if (tab.urlIndex === 0) return;
    const prevTab = tab.history[tab.urlIndex - 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex - 1 }) : t));
    navigate(toAbsolutePath(prevTab.url), { replace: false });
  };

  const handleChangeTab = async (tabId: number) => {
    setTabs(tabs.map((tab) => ({ ...tab, selected: tab.id === tabId })));
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) navigate(toAbsolutePath(tab.history[tab.urlIndex].url), { replace: false });
  };

  const push = async (name: string, url: string) => {
    let selectedTab: Tab | undefined;
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.selected) {
          const newHistory = [...tab.history.slice(0, tab.urlIndex + 1), { name, url }];
          if (newHistory.length > MAX_HISTORY) newHistory.shift();
          selectedTab = { ...tab, history: newHistory, urlIndex: newHistory.length - 1 };
          return selectedTab;
        }
        return tab;
      })
    );
  
    setTimeout(() => {
      navigate(toAbsolutePath(url), { replace: false });
    }, 0);
  };

  const closeDetailsBtn = async () => {
    let selectedTab: Tab | undefined;
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.selected) {
          const prevPage = tab.history[tab.history.length - 2].url !== location.pathname ? tab.history[tab.history.length - 2] : tab.history[tab.history.length - 3];
          if (!prevPage) return tab;
          const newHistory = [...tab.history.slice(0, tab.urlIndex + 1), { name: prevPage.name, url: prevPage.url }];
          selectedTab = { ...tab, history: newHistory, urlIndex: newHistory.length - 1 };
          return selectedTab;
        }
        return tab;
      })
    );
  
    setTimeout(() => {
      if (selectedTab) navigate(toAbsolutePath(selectedTab.history[selectedTab.history.length - 1].url), { replace: false });
    }, 0);
  };

  const newTab = async (history = [{ name: 'Home', url: '/' }], moveImmediately = true) => {
    const id = tabs.length ? Math.max(...tabs.map(t => t.id)) + 1 : 1;
    const newTabObj: Tab = {
      id,
      name: null,
      urlIndex: 0,
      history,
      selected: false
    };
    const newTabs = [...tabs.map(t => ({ ...t, selected: moveImmediately ? false : t.selected })), newTabObj];

    if (moveImmediately) {
      const tabsWithSelection = newTabs.map((t) => ({ ...t, selected: t.id === id }));
      setTabs(tabsWithSelection);
      navigate(toAbsolutePath(history[0].url), { replace: false });
    } else {
      setTabs(newTabs);
    }
  };

  const deleteTab = async (id: number) => {
    let newTabs = tabs.filter((t) => t.id !== id);
    const wasSelected = tabs.find((t) => t.id === id)?.selected;
    if (wasSelected && newTabs.length > 0) {
      const oldIndex = tabs.findIndex((t) => t.id === id);
      const newSelectedIndex = oldIndex > 0 ? oldIndex - 1 : 0;
      newTabs = newTabs.map((t, i) => ({ ...t, selected: i === newSelectedIndex }));
      navigate(toAbsolutePath(newTabs[newSelectedIndex].history[newTabs[newSelectedIndex].urlIndex].url), { replace: false });
    }
    setTabs(newTabs);
  };
  
  return { tabs, setTabs, forward, backward, handleChangeTab, push, newTab, closeDetailsBtn, deleteTab };
}
