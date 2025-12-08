import { formatDate } from "@/scripts/tools/stringUtils";
import Modal from "@/components/library/Modal";
import { useEffect, useState } from "react";

interface Props {
  alerts: Alert[]
  setAlerts: (alert: Alert[]) => void
}


export default function AlertModal({ alerts, setAlerts }: Props) {
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    setAlert(alerts[0]);
  }, [alerts]);

  const getAlertType = (type: string) => {
    switch (type) {
      case 'ALERT!!!':
        return 'alert';
      case 'HUDDLE UP!!!':
        return 'huddle-up';
      case 'CAT IS OUT!!!':
        return 'cat-is-out';
      case 'SYSTEMS CHECK!!!':
        return 'systems-check';
      case 'SEE JACK!!!':
        return 'see-jack';
      case 'SEE TERRY!!!':
        return 'see-terry';
      case 'HUDDLE OR JAIL!!!':
        return 'huddle-or-jail';
      default:
        return '';
    }
  };

  const handleClose = () => {
    const filteredAlerts = alerts.filter((a) => a.id !== alert?.id);
    setAlerts(filteredAlerts);
  };


  return (
    <>
      {alert &&
        <Modal
          open
          onClose={handleClose}
          className={`alert alert--${getAlertType(alert.type)}`}
        >
          <h2 className="alert__top-msg">STOP!!!</h2>
          <h2 className="alert__type">{ alert.type }</h2>
          <h2 className="alert__part-num">{ alert.partNum }</h2>
          <p className="alert__note">{ alert.note }</p>
          <h3 className="alert__footer">Marked per { alert.addedBy } on { formatDate(alert.date) }</h3>
        </Modal>
      }
    </>
  );
}
