import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { addMapLocation, getGeoLocation } from "@/scripts/services/mapService";
import { FormEvent, useEffect, useState } from "react";
import { ask } from "@/scripts/config/tauri";
import TextArea from "@/components/library/TextArea";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  customer: Customer
  userId: number
}


export default function AddToMapDialog({ open, setOpen, customer, userId }: Props) {
  const [name, setName] = useState<string>(customer.company ?? '');
  const [address, setAddress] = useState<string>([customer.billToAddress, customer.billToCity, customer.billToState, customer.billToZip].filter(Boolean).join(', '));
  const [type, setType] = useState<MapLocationType>('customer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setName(customer.company ?? '');
    setAddress([customer.billToAddress, customer.billToCity, customer.billToState, customer.billToZip].filter(Boolean).join(', '));
  }, [customer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!await ask('Are you sure?')) return;
    const location = (await getGeoLocation(address))[0];
    const loc = {
      name,
      address: location.formatted_address,
      lat: location.geometry.location.lat,
      lng: location.geometry.location.lng,
      type,
      salesmanId: userId,
      customerId: customer.id,
      legacyId: null,
      date: new Date(),
      notes
    };
    await addMapLocation(loc);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Map Location"
      width={300}
      height={400}
      x={800}
      y={-50}
    >
      <form onSubmit={handleSubmit}>
        <Input
          variant={['label-bold', 'label-stack']}
          label="Name"
          value={name ?? ''}
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
