import { userAtom, alertsAtom, tabsAtom, tooltipAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Login from "./Login";
import { getUser } from "@/scripts/services/userService";
import { getAlerts } from "@/scripts/services/alertsService";
import { checkUpdate } from '@tauri-apps/api/updater';
import UpdateModal from "./Modals/UpdateModal";
import { getTabsByUser } from "@/scripts/services/tabsService";
import ToastContainer from "@/containers/ToastContainer";
import Tooltip from "./Library/Tooltip";

interface Props {
  children: any
}


export default function GlobalData({ children }: Props) {
  const [, setUserData] = useAtom<User>(userAtom);
  const [tabs, setTabs] = useAtom<Tab[]>(tabsAtom);
  const [, setAlertsData] = useAtom<Alert[]>(alertsAtom);
  const [tooltip] = useAtom<string>(tooltipAtom);
  const [user, setUser] = useState<User>();
  const [loaded, setLoaded] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  useEffect(() => {
    checkForUpdates();
    const fetchData = async () => {
      await handleGetUser();
      setLoaded(true);
      setAlertsData(await getAlerts());
      // const tabs = await getTabsByUser();
      setTabs([{
        id: 0,
        name: null,
        urlIndex: 0,
        history: [{ name: 'Home', url: '/' }],
        selected: true
      }]);
    };
    fetchData();
  }, []);

  const handleGetUser = async () => {
    const res = await getUser();
    setUser(res);
    (setUserData as any)(res);
  };

  const checkForUpdates = async () => {
    if (!window?.__TAURI_IPC__) return;
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      setUpdateDialogOpen(true);
    }
  };


  return (
    <>
      <UpdateModal open={updateDialogOpen} setOpen={setUpdateDialogOpen} />
      <ToastContainer />
      { tooltip && <Tooltip msg={tooltip} /> }
      { user ? children : loaded && <Login /> }
    </>
  );
}
