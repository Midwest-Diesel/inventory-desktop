import { picturesAtom, userAtom, alertsAtom, snPicturesAtom, tabsAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Login from "./Login";
import { getUser } from "@/scripts/controllers/userController";
import { getAlerts } from "@/scripts/controllers/alertsController";
import { checkUpdate } from '@tauri-apps/api/updater';
import UpdateModal from "./Modals/UpdateModal";
import { getTabsByUser } from "@/scripts/controllers/tabsController";

interface Props {
  children: any
}


export default function GlobalData({ children }: Props) {
  const [userData, setUserData] = useAtom<User>(userAtom);
  const [tabs, setTabs] = useAtom<Tab[]>(tabsAtom);
  const [user, setUser] = useState<User>();
  const [loaded, setLoaded] = useState(false);
  const [alertsData, setAlertsData] = useAtom<Alert[]>(alertsAtom);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  useEffect(() => {
    checkForUpdates();
    const fetchData = async () => {
      await handleGetUser();
      setLoaded(true);
      setAlertsData(await getAlerts());
      const tabs = await getTabsByUser();
      setTabs(tabs);
    };
    fetchData();
  }, []);

  const handleGetUser = async () => {
    const res = await getUser();
    setUser(res);
    setUserData(res);
  };

  const checkForUpdates = async () => {
    if (!window.__TAURI_IPC__) return;
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      setUpdateDialogOpen(true);
    }
  };


  return (
    <>
      <UpdateModal open={updateDialogOpen} setOpen={setUpdateDialogOpen} />
      { user ? children : loaded && <Login /> }
    </>
  );
}
