import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import Select from "@/components/Library/Select/Select";
import { getCustomerById, getCustomers } from "@/scripts/controllers/customerController";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onSubmit: (data: any) => void
}


export default function AddMapLocationDialog({ open, setOpen, onSubmit }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('' as any);
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
    setCustomerId('');
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
          value={customerId}
          onChange={async (e: any) => {
            const customer: Customer = await getCustomerById(e.target.value);
            setCustomerId(customer.id);
            setName(customer.company);
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
          onChange={(e: any) => setName(e.target.value)}
          required
        />
        <Input
          variant={['label-bold']}
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
