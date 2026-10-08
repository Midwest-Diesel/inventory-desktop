import { FormEvent, useState } from "react";
import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { getCustomerById } from "@/scripts/services/customerService";
import TextArea from "@/components/library/TextArea";
import CustomerSelectId from "@/components/library/select/CustomerSelectId";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  data: MapLocation
  onSubmit: (data: LocationFormData) => void
}


export default function EditMapLocationDialog({ open, setOpen, data, onSubmit }: Props) {
  const [customerId, setCustomerId] = useState<number>(data.customer.id);
  const [name, setName] = useState<string>(data.name);
  const [address, setAddress] = useState<string | null>(data.address);
  const [type, setType] = useState<MapLocationType>(data.type ?? 'customer');
  const [notes, setNotes] = useState<string | null>(data.notes);  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ id: data.id, name, address, type, customerId, notes });
    setOpen(false);
  };


  return(
    <Dialog
      title="Edit Map Location"
      open={open}
      setOpen={setOpen}
      width={400}
    >
      <form onSubmit={handleSubmit}>
        <CustomerSelectId
          variant={['label-stack', 'label-bold']}
          label="Customer"
          type="number"
          value={customerId}
          onChange={async (e) => {
            if (!e.target.value) return;
            const id = Number(e.target.value);
            const customer = await getCustomerById(id);
            setCustomerId(id);
            setName(customer?.company ?? '');
            setAddress(`${customer?.billToAddress}, ${customer?.billToCity}`);
          }}
        />
        <Input
          variant={['label-bold']}
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          variant={['label-bold']}
          label="Address"
          placeholder="address, city"
          value={address ?? ''}
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
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
