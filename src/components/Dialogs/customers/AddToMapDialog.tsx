import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import Select from "@/components/Library/Select/Select";
import { addMapLocation, getGeoLocation } from "@/scripts/controllers/mapController";
import { FormEvent, useEffect, useState } from "react";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  customer: Customer
  userId: number
}


export default function AddToMapDialog({ open, setOpen, customer, userId }: Props) {
  const [name, setName] = useState(customer.company);
  const [address, setAddress] = useState([customer.billToAddress, customer.billToCity, customer.billToState, customer.billToZip].filter((i) => i).join(', '));
  const [type, setType] = useState<MapLocationType>('customer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setName(customer.company);
    setAddress([customer.billToAddress, customer.billToCity, customer.billToState, customer.billToZip].filter((i) => i).join(', '));
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
