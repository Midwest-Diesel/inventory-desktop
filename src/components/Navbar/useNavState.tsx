import { useRouter } from "next/navigation";
// import { addTab, changeSelectedTab, editTabHistory, getTabsByUser } from "@/scripts/controllers/tabsController";
import { useAtom } from "jotai";
import { tabsAtom } from "@/scripts/atoms/state";


export function useNavState() {
  const router = useRouter();
  const [tabs, setTabs] = useAtom<Tab[]>(tabsAtom);

  const forward = async () => {
    const tab = tabs.find((t) => t.selected);
    if (!tab) return;
    if (tab.urlIndex === tab.history.length - 1) return;
    const nextTab = tab.history[tab.urlIndex + 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex + 1 }) : t));
    router.replace(nextTab.url);
    // await editTabHistory(tab.id, tab.urlIndex + 1, tab.history);
  };

  const backward = async () => {    
    const tab = tabs.find((t) => t.selected);
    if (!tab) return;
    if (tab.urlIndex === 0) return;
    const prevTab = tab.history[tab.urlIndex - 1];
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex - 1 }) : t));
    router.replace(prevTab.url);
    // await editTabHistory(tab.id, tab.urlIndex - 1, tab.history);
  };

  const handleChangeTab = async (tabId: number) => {
    setTabs(tabs.map((tab) => ({ ...tab, selected: tab.id === tabId })));
    // await changeSelectedTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) router.replace(tab.history[tab.urlIndex].url);
  };

  const push = async (name: string, url: string) => {
    let selectedTab: Tab | undefined;
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.selected) {
          const newHistory = [...tab.history.slice(0, tab.urlIndex + 1), { name, url }];
          selectedTab = { ...tab, history: newHistory, urlIndex: newHistory.length - 1 };
          return selectedTab;
        }
        return tab;
      })
    );
  
    // if (selectedTab) {
    //   await editTabHistory(selectedTab.id, selectedTab.urlIndex, selectedTab.history);
    // }
  
    setTimeout(() => {
      router.replace(url);
    }, 0);
  };

  const closeBtn = async () => {
    let selectedTab: Tab | undefined;
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.selected) {
          const prevPage = tab.history[tab.history.length - 2];
          if (!prevPage) return tab;
          const newHistory = [...tab.history.slice(0, tab.urlIndex + 1), { name: prevPage.name, url: prevPage.url }];
          selectedTab = { ...tab, history: newHistory, urlIndex: newHistory.length - 1 };
          console.log(selectedTab);
          return selectedTab;
        }
        return tab;
      })
    );
  
    setTimeout(() => {
      if (selectedTab) router.replace(selectedTab.history[selectedTab.history.length - 1].url);
    }, 0);
  };

  const newTab = async (history = [{ name: 'Home', url: '/' }], moveImmediately = true) => {
    // await addTab([{ name: 'Home', url: '/' }]);
    // const res = await getTabsByUser();
    // setTabs(res);
    const id = tabs.length + 1;
    const newTabs = [...tabs, {
      id,
      name: null,
      urlIndex: 0,
      history,
      selected: false
    }];
    setTabs(newTabs);

    if (moveImmediately) {
      setTabs(newTabs.map((tab) => ({ ...tab, selected: tab.id === id })));
      // await changeSelectedTab(tabId);
      const tab = newTabs.find((t) => t.id === id);
      if (tab) router.replace(tab.history[tab.urlIndex].url);
    }
  };
  
  return { tabs, setTabs, forward, backward, handleChangeTab, push, closeBtn, newTab };
}
