import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { editMapLocation, getGeoLocation } from "@/scripts/services/mapService";
import { FormEvent, useState } from "react";
import { ask } from "@/scripts/config/tauri";
import TextArea from "@/components/library/TextArea";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  location: MapLocation | null
}


export default function EditMapLocDialog({ open, setOpen, location }: Props) {
  const [name, setName] = useState<string>(location?.name ?? '');
  const [address, setAddress] = useState<string>(location?.address ?? '');
  const [type, setType] = useState<MapLocationType>(location?.type ?? '');
  const [notes, setNotes] = useState<string>(location?.notes ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!location || !await ask('Are you sure?')) return;
    const res = (await getGeoLocation(address))[0];
    const newLoc = {
      id: location.id,
      name,
      address: res.formatted_address,
      lat: res.geometry.res.lat,
      lng: res.geometry.res.lng,
      type,
      customerId: location.customer?.id,
      legacyId: null,
      date: location.date,
      notes
    };
    await editMapLocation(newLoc);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Edit Map Location"
      width={300}
      height={400}
      x={800}
      y={-50}
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          variant={['label-bold', 'label-stack']}
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          variant={['label-bold', 'label-stack']}
          label="Address"
          placeholder="address, city"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <Select
          variant={['label-stack', 'label-bold']}
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as MapLocationType)}
        >
          <option>customer</option>
          <option>vendor</option>
        </Select>
        <TextArea
          variant={['label-bold']}
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
