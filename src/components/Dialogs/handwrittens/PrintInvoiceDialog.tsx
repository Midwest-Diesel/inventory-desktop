import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import { invoke } from "@tauri-apps/api/tauri";
import Checkbox from "@/components/Library/Checkbox";
import Button from "@/components/Library/Button";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
}


export default function PrintInvoiceDialog({ open, setOpen, handwritten }: Props) {
  const [accounting, setAccounting] = useState(true);
  const [shipping, setShipping] = useState(true);
  const [coreDeposit, setCoreDeposit] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    const args = {
      billToCompany: handwritten.billToCompany || '',
      billToAddress: handwritten.billToAddress || '',
      billToAddress2: handwritten.billToAddress2 || '',
      billToCity: handwritten.billToCity || '',
      billToState: handwritten.billToState || '',
      billToZip: handwritten.billToZip || '',
      billToCountry: handwritten.billToCountry || '',
      shipToCompany: handwritten.shipToCompany || '',
      shipToAddress: handwritten.shipToAddress || '',
      shipToAddress2: handwritten.shipToAddress2 || '',
      shipToCity: handwritten.shipToCity || '',
      shipToState: handwritten.shipToState || '',
      shipToZip: handwritten.shipToZip || '',
      shipToContact: handwritten.shipToContact || '',
      shipToCountry: '',
      accountNum: '',
      cardNum: handwritten.cardNum || '',
      expDate: handwritten.expDate || '',
      cvv: handwritten.cvv || '',
      cardName: handwritten.cardName || '',
      cardAddress: handwritten.cardAddress || '',
      paymentType: handwritten.payment || '',
      contactPhone: handwritten.phone || '',
      contactCell: handwritten.cell || '',
      contactEmail: handwritten.email || '',
      contactFax: handwritten.fax || '',
      model: '',
      serialNum: handwritten.engineSerialNum || '',
      arrNum: '',
      taxable: false,
      blind: handwritten.isBlindShipment,
      npi: handwritten.isNoPriceInvoice,
      collect: handwritten.isCollect,
      thirdParty: handwritten.isThirdParty
    };
    await invoke('print_shipping_invoice', { args });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Print Invoice"
      y={-150}
      width={300}
    >
      <form onSubmit={handleSubmit}>
        <Checkbox
          variant={['label-bold', 'dark-bg', 'label-align-center']}
          label="Print Accounting Copy"
          checked={accounting}
          onChange={(e: any) => setAccounting(e.target.checked)}
        />
        <Checkbox
          variant={['label-bold', 'dark-bg', 'label-align-center']}
          label="Print Shipping Copy"
          checked={shipping}
          onChange={(e: any) => setShipping(e.target.checked)}
        />
        <Checkbox
          variant={['label-bold', 'dark-bg', 'label-align-center']}
          label="Print Core Deposit Copy"
          checked={coreDeposit}
          onChange={(e: any) => setCoreDeposit(e.target.checked)}
        />
        
        <div className="form__footer">
          <Button type="submit">Print</Button>
        </div>
      </form>
    </Dialog>
  );
}
