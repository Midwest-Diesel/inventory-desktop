import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import CustomerSelectId from "@/components/library/select/CustomerSelectId";
import { getCustomerById } from "@/scripts/services/customerService";
import { getVendorByName } from "@/scripts/services/vendorsService";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onSubmit: (data: LocationFormData) => void
}


export default function AddMapLocationDialog({ open, setOpen, onSubmit }: Props) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const vendor = await getVendorByName(name);
    const type: MapLocationType = vendor?.id ? 'vendor' : 'customer';
    onSubmit({ name, address, type, notes: null, customerId });

    setCustomerId(null);
    setName('');
    setAddress('');
    setOpen(false);
  };


  return(
    <Dialog
      title="Add Map Location"
      open={open}
      setOpen={setOpen}
      width={400}
    >
      <form onSubmit={handleSubmit}>
        <CustomerSelectId
          variant={['label-stack', 'label-bold']}
          label="Customer"
          type="number"
          value={customerId ?? ''}
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
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
