import React, { useEffect } from "react";
import Navbar from "./Navbar/Navbar";
import AlertModal from "./Modals/AlertModal";
import { useAtom } from "jotai";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { errorAtom, userAtom } from "@/scripts/atoms/state";
import Toast from "./Library/Toast";

interface Props {
  children: React.ReactNode
  title?: string
}


export function Layout({ children, title }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [alerts, setAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [error, setError] = useAtom<string>(errorAtom);

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
      <AlertModal alerts={alerts} setAlerts={setAlerts} />
      { user && <Navbar /> }
      {error &&
        <Toast
          type="error"
          msg={error}
          duration={8000}
          open={error !== ''}
          setOpen={(value: boolean) => !value && setError('')}
        />
      }
      <div className="layout__container">
        <div className="layout__main-content">
          { children }
        </div>
      </div>
    </div>
  );
}
