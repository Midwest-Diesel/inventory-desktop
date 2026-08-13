import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import { massLocationChange } from "@/scripts/services/partsService";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
}


export default function MassLocationChangeDialog({ open, setOpen }: Props) {
  const [oldLocation, setOldLocation] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!oldLocation || !newLocation) {
      alert('Locations cannot be blank');
      return;
    }

    await massLocationChange(oldLocation, newLocation);
    location.reload();
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      width={300}
      x={800}
      y={-70}
    >
      <form onSubmit={onSubmit}>
        <div>
          <Input
            variant={['label-bold', 'label-stack']}
            label="Old Location"
            value={oldLocation}
            onChange={(e) => setOldLocation(e.target.value)}
            required
          />
          <Input
            variant={['label-bold', 'label-stack']}
            label="New Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            required
          />
        </div>

        <div className="form__footer">
          <Button variant={['fit']} type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
