import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { useAtom } from "jotai";
import { alertsAtom, userAtom } from "@/scripts/atoms/state";
import { addAlert, getAlerts } from "@/scripts/controllers/alertsController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function CreateAlertDialog({ open, setOpen }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [alertsData, setAlertsAtom] = useAtom<Alert[]>(alertsAtom);
  const [type, setType] = useState('');
  const [partNum, setPartNum] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newAlert = {
      type,
      partNum,
      date: new Date(),
      salesmanId: user.id,
      note
    } as any;
    await addAlert(newAlert);
    setOpen(false);
    setAlertsAtom(await getAlerts());
  };

  const clearInputs = () => {
    setType('');
    setPartNum('');
    setNote('');
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="New Alert"
      maxHeight="44rem"
      width={400}
      data-testid="new-alert-dialog"
    >
      <form onSubmit={(e)=> handleSubmit(e)}>
        <Input
          label="Alert Type"
          variant={['label-space-between', 'label-full-width', 'small', 'thin', 'label-bold']}
          value={type}
          onChange={(e: any) => setType(e.target.value)}
          data-testid="alert-type-input"
          placeholder="ALERT!!!"
          required
        />

        <Input
          label="Part Number"
          variant={['label-space-between', 'label-full-width', 'small', 'thin', 'label-bold']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
          data-testid="part-num-input"
          required
        />

        <Input
          label="Note"
          variant={['label-stack', 'label-bold', 'text-area']}
          rows={5}
          cols={100}
          value={note}
          onChange={(e: any) => setNote(e.target.value)}
          data-testid="note-input"
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs} data-testid="clear">Clear</Button>
          <Button type="submit" variant={['small']} data-testid="save">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}