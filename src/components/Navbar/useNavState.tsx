import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTab, changeSelectedTab, editTabHistory, getTabsByUser } from "@/scripts/controllers/tabsController";
import { useAtom } from "jotai";
import { tabsAtom } from "@/scripts/atoms/state";


export function useNavState() {
  const router = useRouter();
  const [tabs, setTabs] = useAtom<Tab[]>(tabsAtom);

  const forward = async () => {
    const tab = tabs.find((t) => t.selected);
    if (tab.urlIndex === tab.history.length - 1) return;
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex + 1 }) : t));
    router.replace(tab.history[tab.urlIndex + 1].url);
    await editTabHistory(tab.id, tab.urlIndex + 1, tab.history);
  };

  const backward = async () => {
    const tab = tabs.find((t) => t.selected);
    if (tab.urlIndex === 0) return;
    setTabs(tabs.map((t) => t.id === tab.id ? ({ ...t, urlIndex: t.urlIndex - 1 }) : t));
    router.replace(tab.history[tab.urlIndex - 1].url);
    await editTabHistory(tab.id, tab.urlIndex - 1, tab.history);
  };

  const handleChangeTab = async (tabId: number) => {
    setTabs(tabs.map((tab) => ({ ...tab, selected: tab.id === tabId })));
    await changeSelectedTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    router.replace(tab.history[tab.urlIndex].url);
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
  
    if (selectedTab) {
      await editTabHistory(selectedTab.id, selectedTab.urlIndex, selectedTab.history);
    }
  
    setTimeout(() => {
      router.replace(url);
    }, 0);
  };  

  const newTab = async () => {
    await addTab([{ name: 'Home', url: '/' }]);
    const res = await getTabsByUser();
    setTabs(res);
  };
  
  return { tabs, setTabs, forward, backward, handleChangeTab, push, newTab };
}
