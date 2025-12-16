import Modal from "../../library/Modal";
import { useEffect, useState } from "react";
import CustomerHandwrittenItemsList from "../../dashboard/CustomerHandwrittenItemsList";
import Button from "../../library/Button";
import CustomerHandwrittensList from "@/components/dashboard/CustomerHandwrittensList";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  company: string
}


export default function HandwrittensListModal({ open, setOpen, company }: Props) {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (!open) setShowItems(false);
  }, [open]);


  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      closeOnOutsideClick={true}
      maxHeight="70vh"
    >
      <div style={{ marginBottom: '0.3rem' }}>
        <Button onClick={() => setShowItems(!showItems)}>{ showItems ? 'Hide' : 'Show' } Items</Button>
      </div>

      {showItems ?
        <CustomerHandwrittenItemsList company={company} />
        :
        <CustomerHandwrittensList company={company} />
      }
    </Modal>
  );
}
