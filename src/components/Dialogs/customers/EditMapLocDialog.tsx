import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import Select from "@/components/Library/Select/Select";
import { editMapLocation, getGeoLocation } from "@/scripts/controllers/mapController";
import { confirm } from "@/scripts/config/tauri";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  loc: MapLocation | null
}


export default function EditMapLocDialog({ open, setOpen, loc }: Props) {
  const [name, setName] = useState<string>(loc?.name ?? '');
  const [address, setAddress] = useState<string>(loc?.address ?? '');
  const [type, setType] = useState<MapLocationType>(loc?.type ?? '');
  const [notes, setNotes] = useState<string>(loc?.notes ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loc || !await confirm('Are you sure?')) return;
    const location = (await getGeoLocation(address))[0];
    const newLoc = {
      id: loc.id,
      name,
      address: location.formatted_address,
      lat: location.geometry.location.lat,
      lng: location.geometry.location.lng,
      type,
      customerId: loc.customer?.id,
      legacyId: null,
      date: loc.date,
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
          onChange={(e: any) => setName(e.target.value)}
          required
        />
        <Input
          variant={['label-bold', 'label-stack']}
          label="Address"
          placeholder="address, city"
          value={address}
          onChange={(e: any) => setAddress(e.target.value)}
          required
        />
        <Select
          variant={['label-stack', 'label-bold']}
          label="Type"
          value={type}
          onChange={(e: any) => setType(e.target.value)}
        >
          <option>customer</option>
          <option>vendor</option>
        </Select>
        <Input
          variant={['label-bold', 'text-area']}
          label="Notes"
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
