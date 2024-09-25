import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import Select from "../../Library/Select/Select";
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
  const [userData] = useAtom<User>(userAtom);
  const [alertsData, setAlertsAtom] = useAtom<Alert[]>(alertsAtom);
  const [type, setType] = useState('ALERT!!!');
  const [partNum, setPartNum] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newAlert = {
      type,
      partNum,
      date: new Date(),
      addedBy: userData.initials,
      note
    } as Alert;
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
      data-cy="new-alert-dialog"
    >
      <form onSubmit={(e)=> handleSubmit(e)}>
        <Select
          label="Alert Type"
          variant={['label-full-width', 'label-space-between']}
          value={type}
          onChange={(e: any) => setType(e.target.value)}
          data-cy="alert-type"
        >
          <option>ALERT!!!</option>
          <option>HUDDLE UP!!!</option>
          <option>CAT IS OUT!!!</option>
          <option>SYSTEMS CHECK!!!</option>
          <option>SEE JACK!!!</option>
          <option>SEE TERRY!!!</option>
          <option disabled={userData.username !== 'jon'}>HUDDLE OR JAIL!!!</option>
        </Select>

        <Input
          label="Part Number"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
          required
          data-cy="part-num"
        />

        <Input
          label="Note"
          variant={['label-stack', 'label-bold', 'text-area']}
          rows={5}
          cols={100}
          value={note}
          onChange={(e: any) => setNote(e.target.value)}
          data-cy="note"
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs} data-cy="clear">Clear</Button>
          <Button type="submit" variant={['small']} data-cy="save">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}