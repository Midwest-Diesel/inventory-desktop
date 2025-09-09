import { userAtom, alertsAtom, tabsAtom, tooltipAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Login from "./Login";
import { getUser } from "@/scripts/services/userService";
import { getAlerts } from "@/scripts/services/alertsService";
import { checkUpdate } from '@tauri-apps/api/updater';
import UpdateModal from "./Modals/UpdateModal";
import ToastContainer from "@/containers/ToastContainer";
import Tooltip from "./Library/Tooltip";
import { useNavigate } from "react-router-dom";

interface Props {
  children: any
}


export default function GlobalData({ children }: Props) {
  const navigate = useNavigate();
  const [, setUserData] = useAtom<User>(userAtom);
  const [, setTabs] = useAtom<Tab[]>(tabsAtom);
  const [, setAlertsData] = useAtom<Alert[]>(alertsAtom);
  const [tooltip] = useAtom<string>(tooltipAtom);
  const [user, setUser] = useState<User>();
  const [loaded, setLoaded] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    checkForUpdates();
    const fetchData = async () => {
      await handleGetUser();
      setLoaded(true);
      setAlertsData(await getAlerts());
      const tabs = (): Tab[] => {
        const stored = localStorage.getItem('tabs');
        if (!stored) return [{ id: 0, name: null, urlIndex: 0, history: [{name: 'Home', url: '/'}], selected: true }];
        return JSON.parse(stored);
      };
      setTabs(tabs());
      const selectedTab = tabs().find((t) => t.selected);
      if (selectedTab) navigate(selectedTab.history[selectedTab.urlIndex].url, { replace: false });
    };
    fetchData();

    const handleMiddleClick = async (e: MouseEvent) => {
      if (e.button === 1) {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (!link) return;
        e.preventDefault();
        e.stopImmediatePropagation();
  
        // const url = link.getAttribute('data-href');
        // await push(link.textContent, url);
      }
    };
    document.addEventListener('auxclick', handleMiddleClick);
  
    return () => {
      document.removeEventListener('auxclick', handleMiddleClick);
    };
  }, []);

  const handleGetUser = async () => {
    const res = await getUser();
    if (!res) return;
    setUser(res);
    (setUserData as any)(res);
  };

  const checkForUpdates = async () => {
    if (!window?.__TAURI_IPC__) return;
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      setUpdateDialogOpen(true);
      setUpdateNotes(update.manifest?.body ?? '');
    }
  };


  return (
    <>
      <UpdateModal open={updateDialogOpen} setOpen={setUpdateDialogOpen} notes={updateNotes} />
      <ToastContainer />
      { tooltip && <Tooltip msg={tooltip} /> }
      { user ? children : loaded && <Login /> }
    </>
  );
}
