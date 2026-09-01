import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import TextArea from "@/components/library/TextArea";
import { LocationFormData } from "@/pages/map";
import { getCustomerById, getCustomers } from "@/scripts/services/customerService";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onSubmit: (data: LocationFormData) => void
}


export default function AddMapLocationDialog({ open, setOpen, onSubmit }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<MapLocationType>('customer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCustomers();
      setCustomers(res);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name, address, type, notes, customerId });
    setCustomerId(null);
    setName('');
    setAddress('');
    setType('customer');
    setNotes('');
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
        <Select
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
        >
          <option value="">-- SELECT A CUSTOMER --</option>
          {customers.map((customer) => {
            return <option key={customer.id} value={customer.id}>{ customer.company }</option>;
          })}
        </Select>
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
