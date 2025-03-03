import { FormEvent, useState } from "react";
import Button from "@/components/Library/Button";
import Modal from "@/components/Library/Modal";
import Input from "@/components/Library/Input";
import { editCustomer } from "@/scripts/controllers/customerController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  customer: Customer
  handwritten: Handwritten
  setIsEditing: (value: boolean) => void
}


export default function ChangeCustomerInfoDialog({ open, setOpen, customer, handwritten, setIsEditing }: Props) {
  const [billToCompany, setBillToCompany] = useState<string>(handwritten.billToCompany);
  const [billToAddress, setBillToAddress] = useState<string>(handwritten.billToAddress);
  const [billToAddress2, setBillToAddress2] = useState<string>(handwritten.billToAddress2);
  const [billToCity, setBillToCity] = useState<string>(handwritten.billToCity);
  const [billToState, setBillToState] = useState<string>(handwritten.billToState);
  const [billToZip, setBillToZip] = useState<string>(handwritten.billToZip);
  const [billToPhone, setBillToPhone] = useState<string>(handwritten.billToPhone);
  const [showBillToCompany] = useState<boolean>((billToCompany || '') !== (customer.company || ''));
  const [showBillToAddress] = useState<boolean>((billToAddress || '') !== (customer.billToAddress || ''));
  const [showBillToAddress2] = useState<boolean>((billToAddress2 || '') !== (customer.billToAddress2 || ''));
  const [showBillToCity] = useState<boolean>((billToCity || '') !== (customer.billToCity || ''));
  const [showBillToState] = useState<boolean>((billToState || '') !== (customer.billToState || ''));
  const [showBillToZip] = useState<boolean>((billToZip || '') !== (customer.billToZip || ''));
  const [showBillToPhone] = useState<boolean>((billToPhone || '') !== (customer.billToPhone || ''));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    await editCustomer({ ...customer, company: billToCompany, billToAddress, billToAddress2, billToCity, billToState, billToZip, billToPhone });
  };


  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Change Customer Info?"
      exitWithEsc={false}
      showCloseBtn={false}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <h3>Old Customer Info</h3>
            { showBillToCompany && <p><strong>Bill to Company</strong> { customer.company }</p> }
            { showBillToAddress && <p><strong>Bill to Address</strong> { customer.billToAddress }</p> }
            { showBillToAddress2 && <p><strong>Bill to Address 2</strong> { customer.billToAddress2 }</p> }
            { showBillToCity && <p><strong>Bill to City</strong> { customer.billToCity }</p> }
            { showBillToState && <p><strong>Bill to State</strong> { customer.billToState }</p> }
            { showBillToZip && <p><strong>Bill to Zip</strong> { customer.billToZip }</p> }
            { showBillToPhone && <p><strong>Bill to Phone</strong> { customer.billToPhone }</p> }
          </div>

          <div>
            <h3>New Changes</h3>
            {showBillToCompany &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to Company"
                value={billToCompany}
                onChange={(e: any) => setBillToCompany(e.target.value)}
              />
            }
            {showBillToAddress &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to Address"
                value={billToAddress}
                onChange={(e: any) => setBillToAddress(e.target.value)}
              />
            }
            {showBillToAddress2 &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to Address 2"
                value={billToAddress2}
                onChange={(e: any) => setBillToAddress2(e.target.value)}
              />
            }
            {showBillToCity &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to City"
                value={billToCity}
                onChange={(e: any) => setBillToCity(e.target.value)}
              />
            }
            {showBillToState &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to State"
                value={billToState}
                onChange={(e: any) => setBillToState(e.target.value)}
              />
            }
            {showBillToZip &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to Zip"
                value={billToZip}
                onChange={(e: any) => setBillToZip(e.target.value)}
              />
            }
            {showBillToPhone &&
              <Input
                variant={['label-bold', 'label-no-stack', 'label-space-between']}
                label="Bill to Phone"
                value={billToPhone}
                onChange={(e: any) => setBillToPhone(e.target.value)}
              />
            }
          </div>
        </div>

        <div className="form__footer">
          <Button type="button" onClick={() => setIsEditing(false)}>No Changes</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
