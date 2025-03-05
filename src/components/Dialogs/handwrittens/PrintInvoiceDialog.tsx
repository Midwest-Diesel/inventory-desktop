import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import { invoke } from "@/scripts/config/tauri";
import Checkbox from "@/components/Library/Checkbox";
import Button from "@/components/Library/Button";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";

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
    const itemTotals: number[] = handwritten.handwrittenItems.map((item) => item.qty * item.unitPrice);
    const handwrittenTotal = formatCurrency(itemTotals.reduce((acc, cur) => acc + cur, 0));
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
      paymentType: handwritten.payment || '',
      createdBy: handwritten.createdBy || '',
      soldBy: handwritten.soldBy || '',
      handwrittenId: Number(handwritten.id),
      date: formatDate(handwritten.date) || '',
      contact: handwritten.contactName || '',
      poNum: handwritten.poNum || '',
      shipVia: handwritten.shipVia.name || '',
      source: handwritten.source || '',
      invoiceNotes: handwritten.orderNotes ? handwritten.orderNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
      shippingNotes: handwritten.shippingNotes ? handwritten.shippingNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
      mp: `${handwritten.mp || 0} Mousepads`,
      cap: `${handwritten.cap || 0} Hats`,
      br: `${handwritten.br || 0} Brochures`,
      fl: `${handwritten.fl || 0} Flashlights`,
      setup: handwritten.isSetup || false,
      taxable: handwritten.isTaxable || false,
      blind: handwritten.isBlindShipment || false,
      npi: handwritten.isNoPriceInvoice || false,
      collect: handwritten.isCollect || false,
      thirdParty: handwritten.isThirdParty || false,
      handwrittenTotal,
      items: JSON.stringify(handwritten.handwrittenItems.map((item) => {
        return {
          stockNum: item.stockNum || '',
          location: item.location || '',
          cost: formatCurrency(item.cost).replaceAll(',', '|') || '$0.00',
          qty: item.qty,
          partNum: item.partNum || '',
          desc: item.desc || '',
          unitPrice: formatCurrency(item.unitPrice).replaceAll(',', '|') || '$0.00',
          total: formatCurrency(item.qty * item.unitPrice).replaceAll(',', '|') || '$0.00',
          itemChildren: item.invoiceItemChildren
        };
      })) || '[]'
    };
    const itemChildren = handwritten.handwrittenItems.map((item) => {
      if (item.invoiceItemChildren.length > 0) return item.invoiceItemChildren.map((child) => {
        return {
          cost: formatCurrency(child.cost).replaceAll(',', '|') || '$0.00',
          qty: child.qty,
          partNum: child.partNum,
          desc: child.part.desc,
          stockNum: child.stockNum,
          location: child.part.location,
          unitPrice: formatCurrency(item.unitPrice).replaceAll(',', '|') || '$0.00',
          total: formatCurrency(child.qty * item.unitPrice).replaceAll(',', '|') || '$0.00'
        };
      });
    }).filter((item) => item).flat();
    const itemsWithChildren = JSON.stringify([...JSON.parse(args.items).filter((item) => item.itemChildren.length === 0), ...itemChildren ]);
    const filteredItems = JSON.parse(args.items).map((item) => {
      const { itemChildren, ...rest } = item;
      return { ...rest };
    });

    if (accounting) await invoke('print_accounting_invoice', { args: { ...args, items: JSON.stringify(filteredItems) } });
    if (shipping) await invoke('print_shipping_invoice', { args: { ...args, items: itemsWithChildren } });
    if (coreDeposit) await invoke('print_core_invoice', { args });
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
