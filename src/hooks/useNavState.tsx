import { useAtom } from "jotai";
import { tabsAtom } from "@/scripts/atoms/state";
import { useNavigate } from "react-router-dom";
import { toAbsolutePath } from "@/scripts/tools/stringUtils";
import { useState } from "react";


const MAX_HISTORY = 40;

export function useNavState() {
  const navigate = useNavigate();
  const [tabs, setTabsAtom] = useAtom<Tab[]>(tabsAtom);
  const [, setDeletedTabs] = useState<Tab[]>([]);

  const selectedTab = () => tabs.find((t) => t.selected)!;

  const setTabs = (tabsInput: Tab[] | ((prevTabs: Tab[]) => Tab[])) => {
    const newTabs = typeof tabsInput === 'function' ? (tabsInput as (prev: Tab[]) => Tab[])(tabs) : tabsInput;
    setTabsAtom(newTabs);
    localStorage.setItem('tabs', JSON.stringify(newTabs));
  };

  const forward = async () => {
    const tab = selectedTab();
    if (!tab) return;
    if (tab.urlIndex === tab.history.length - 1) return;
    const nextTab = tab.history[tab.urlIndex + 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex + 1 }) : t));
    navigate(toAbsolutePath(nextTab.url), { replace: false });
  };

  const backward = async () => {    
    const tab = selectedTab();
    if (!tab) return;
    if (tab.urlIndex === 0) return;
    const prevTab = tab.history[tab.urlIndex - 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex - 1 }) : t));
    navigate(toAbsolutePath(prevTab.url), { replace: false });
  };

  const changeTab = async (tabId: number) => {
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

  const newTab = async (history = [{ name: 'Home', url: '/' }], moveImmediately = true, urlIndex = 0) => {
    const id = tabs.length ? Math.max(...tabs.map(t => t.id)) + 1 : 1;
    const newTabObj: Tab = {
      id,
      name: null,
      urlIndex,
      history,
      selected: moveImmediately
    };

    if (moveImmediately) {
      setTabs((t) => [...(t.map((tabs) => ({ ...tabs, selected: false }))), newTabObj]);
      navigate(toAbsolutePath(history[0].url), { replace: false });
    } else {
      setTabs((t) => [...t, newTabObj]);
    }
  };

  const newTabs = async (history = [[{ name: 'Home', url: '/' }]], moveImmediately = false, urlIndex = 0) => {
    setTabs((prev) => {
      let nextId = prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1;

      const newTabObjs: Tab[] = history.map((history, index) => {
        const tab: Tab = {
          id: nextId++,
          name: null,
          urlIndex,
          history,
          selected: moveImmediately && index === 0
        };
        return tab;
      });

      const updated = moveImmediately
        ? [
            ...prev.map(t => ({ ...t, selected: false })),
            ...newTabObjs
          ]
        : [...prev, ...newTabObjs];

      return updated;
    });

    if (moveImmediately) {
      navigate(toAbsolutePath(history[0][0].url), { replace: false });
    }
  };

  const deleteTab = async (id: number) => {
    setDeletedTabs((arr) => [...arr, { ...selectedTab(), urlIndex: selectedTab().urlIndex }]);
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

  const removeLastFromHistory = async () => {
    const tab = selectedTab();
    if (!tab || tab.history.length <= 1) return;
    
    const newHistory = tab.history.slice(0, -1);
    setTabs((prevTabs) => prevTabs.map((t) => {
      if (t.id !== tab.id) return t;
      const urlIndex = t.urlIndex > newHistory.length - 1 ? t.urlIndex - 1 : t.urlIndex;
      return { ...t, history: newHistory, urlIndex };
    }));
    navigate(toAbsolutePath(newHistory[newHistory.length - 1].url), { replace: false });
  };

  const restoreTab = async () => {
    setDeletedTabs((prev) => {
      if (prev.length === 0) return prev;
      const deletedTab = prev[prev.length - 1];
      newTab(deletedTab.history, false, deletedTab.urlIndex);
      return prev.slice(0, -1);
    });
  };
  
  return { tabs, setTabs, forward, backward, changeTab, push, newTab, newTabs, closeDetailsBtn, deleteTab, removeLastFromHistory, selectedTab, restoreTab };
}
