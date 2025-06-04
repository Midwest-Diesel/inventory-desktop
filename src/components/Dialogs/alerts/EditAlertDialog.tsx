import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { useAtom } from "jotai";
import { alertsAtom, userAtom } from "@/scripts/atoms/state";
import { editAlert, getAlerts } from "@/scripts/services/alertsService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  alert: Alert | null
}


export default function EditAlertDialog({ open, setOpen, alert }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [alertsData, setAlertsAtom] = useAtom<Alert[]>(alertsAtom);
  const [type, setType] = useState(alert?.type ?? '');
  const [partNum, setPartNum] = useState(alert?.partNum ?? '');
  const [note, setNote] = useState(alert?.note ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alert) return;
    const newAlert = {
      id: alert.id,
      type,
      partNum,
      date: new Date(),
      salesmanId: user.id,
      note
    } as any;
    await editAlert(newAlert);
    setOpen(false);
    setAlertsAtom(await getAlerts());
  };

  const handelCancel = () => {
    setType(alert?.type ?? '');
    setPartNum(alert?.partNum ?? '');
    setNote(alert?.note ?? '');
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Edit Alert"
      maxHeight="44rem"
      width={400}
      data-testid="edit-alert-dialog"
    >
      <form onSubmit={(e)=> handleSubmit(e)}>
        <Input
          label="Alert Type"
          variant={['label-space-between', 'label-full-width', 'small', 'thin', 'label-bold']}
          value={type}
          onChange={(e: any) => setType(e.target.value)}
          data-testid="alert-type-edit-input"
          placeholder="ALERT!!!"
          required
        />
        
        <Input
          label="Part Number"
          variant={['label-space-between', 'label-full-width', 'small', 'thin', 'label-bold']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
          data-testid="part-num-edit-input"
          required
        />

        <Input
          label="Note"
          variant={['label-stack', 'label-bold', 'text-area']}
          rows={5}
          cols={100}
          value={note}
          onChange={(e: any) => setNote(e.target.value)}
          data-testid="note-edit-input"
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={handelCancel}>Cancel</Button>
          <Button type="submit" variant={['small']} data-testid="edit-save-btn">Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
