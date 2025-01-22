import React, { useEffect } from "react";
import Navbar from "./Navbar/Navbar";
import AlertModal from "./Modals/AlertModal";
import { useAtom } from "jotai";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { userAtom } from "@/scripts/atoms/state";

interface Props {
  children: React.ReactNode
  title?: string
}


export function Layout({ children, title }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [alerts, setAlerts] = useAtom<Alert[]>(selectedAlertsAtom);

  useEffect(() => {
    document.title = title ? `${title} | Inventory` : 'Inventory';

    document.addEventListener('wheel', (event: any) => {
      if (event.target.type === 'number') {
        event.preventDefault();
      }
    }, { passive: false });
  }, []);


  return (
    <div>
      { alert && <AlertModal alerts={alerts} setAlerts={setAlerts} /> }
      { user && <Navbar /> }
      <div className="layout__container">
        <div className="layout__main-content">
          { children }
        </div>
      </div>
    </div>
  );
}
