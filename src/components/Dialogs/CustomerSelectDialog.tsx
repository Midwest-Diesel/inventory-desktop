import { useState } from "react";
import Button from "../Library/Button";
import Dialog from "../Library/Dialog";
import CustomerDropdown from "../Library/Select/CustomerDropdown";
import { getCustomerByName } from "@/scripts/services/customerService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (customer: Customer) => void
}


export default function CustomerSelectDialog({ open, setOpen, onSubmit }: Props) {
  const [customer, setCustomer] = useState('');

  const handleSubmit = async () => {
    const res = await getCustomerByName(customer);
    if (res) onSubmit(res);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Select Customer"
      width={300}
      y={-200}
      className="select-customer-dialog"
      data-testid="select-customer-dialog"
    >
      <CustomerDropdown
        value={customer}
        onChange={(c: string) => setCustomer(c)}
        maxHeight="16rem"
      />
      <div className="form__footer">
        <Button onClick={handleSubmit} data-testid="customer-submit-btn">Submit</Button>
      </div>
    </Dialog>
  );
}
