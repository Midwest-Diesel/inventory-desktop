import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/library/Button";
import Modal from "@/components/library/Modal";
import Input from "@/components/library/Input";
import { editCustomer } from "@/scripts/services/customerService";

interface Props {
  open?: boolean
  onNext?: () => void
  onPrev?: () => void
  onClose?: () => void
  customer: Customer | null
  handwritten: Handwritten | null
}


export default function ChangeCustomerInfoModal({ open, onNext, onPrev, customer, handwritten }: Props) {
  const [loading, setLoading] = useState(true);
  const [billToCompany, setBillToCompany] = useState<string>(handwritten?.billToCompany ?? '');
  const [billToAddress, setBillToAddress] = useState<string>(handwritten?.billToAddress ?? '');
  const [billToAddress2, setBillToAddress2] = useState<string>(handwritten?.billToAddress2 ?? '');
  const [billToCity, setBillToCity] = useState<string>(handwritten?.billToCity ?? '');
  const [billToState, setBillToState] = useState<string>(handwritten?.billToState ?? '');
  const [billToZip, setBillToZip] = useState<string>(handwritten?.billToZip ?? '');
  const showBillToCompany = handwritten?.billToCompany !== customer?.company;
  const showBillToAddress = handwritten?.billToAddress !== customer?.billToAddress;
  const showBillToAddress2 = handwritten?.billToAddress2 !== customer?.billToAddress2;
  const showBillToCity = handwritten?.billToCity !== customer?.billToCity;
  const showBillToState = handwritten?.billToState !== customer?.billToState;
  const showBillToZip = handwritten?.billToZip !== customer?.billToZip;

  useEffect(() => {
    if (!open || !onNext) return;
    const handwrittenBillTo = JSON.stringify({ billToCompany, billToAddress, billToAddress2, billToCity, billToState, billToZip });
    const customerBillTo = JSON.stringify({
      billToCompany: customer?.company ?? '',
      billToAddress: customer?.billToAddress ?? '',
      billToAddress2: customer?.billToAddress2 ?? '',
      billToCity: customer?.billToCity ?? '',
      billToState: customer?.billToState ?? '',
      billToZip: customer?.billToZip ?? ''
    });

    if (handwrittenBillTo === customerBillTo) {
      onNext();
    } else {
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    await editCustomer({ ...customer, company: billToCompany, billToAddress, billToAddress2, billToCity, billToState, billToZip });
    if (onNext) onNext();
  };


  if (loading) return null;

  return (
    <Modal
      open={open}
      title="Change Customer Info?"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <h3>Old Customer Info</h3>
            { showBillToCompany && <p><strong>Bill to Company</strong> { customer?.company || 'EMPTY' }</p> }
            { showBillToAddress && <p><strong>Bill to Address</strong> { customer?.billToAddress || 'EMPTY' }</p> }
            { showBillToAddress2 && <p><strong>Bill to Address 2</strong> { customer?.billToAddress2 || 'EMPTY' }</p> }
            { showBillToCity && <p><strong>Bill to City</strong> { customer?.billToCity || 'EMPTY' }</p> }
            { showBillToState && <p><strong>Bill to State</strong> { customer?.billToState || 'EMPTY' }</p> }
            { showBillToZip && <p><strong>Bill to Zip</strong> { customer?.billToZip || 'EMPTY' }</p> }
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
          </div>
        </div>

        <div className="form__footer">
          { onPrev && <Button onClick={onPrev}>Back</Button> }
          <Button onClick={onNext} data-testid="no-changes-btn">No Changes</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
