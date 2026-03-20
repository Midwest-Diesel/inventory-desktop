import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../library/Dialog";
import Checkbox from "@/components/library/Checkbox";
import Button from "@/components/library/Button";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { usePrintQue } from "@/hooks/usePrintQue";
import { getAllShippingItems } from "@/scripts/logic/handwrittens";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten | null
}


const MAX_ROWS = 12;

export default function PrintInvoiceDialog({ open, setOpen, handwritten }: Props) {
  const { addToQue, printQue } = usePrintQue();
  const [accounting, setAccounting] = useState(true);
  const [shipping, setShipping] = useState(true);
  const [coreDeposit, setCoreDeposit] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCoreDeposit(Boolean(handwritten?.handwrittenItems.some((item) => item.location === 'CORE DEPOSIT')));
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    const itemTotals: number[] = handwritten?.handwrittenItems.map((item) => (item?.qty ?? 0) * (item?.unitPrice ?? 0)) ?? [];
    const handwrittenTotal = formatCurrency(itemTotals.reduce((acc, cur) => acc + cur, 0));

    const splitItems = (items: any[], size: number) => {
      const chunks = [];
      for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
      }
      return chunks;
    };
    if (!handwritten) return;
    const itemChunks = splitItems(handwritten.handwrittenItems ?? [], MAX_ROWS);
    const shippingChunks = splitItems(getAllShippingItems(handwritten), MAX_ROWS);

    if (accounting) printHandwrittenOnlyItems(itemChunks, handwrittenTotal, coreDeposit);
    if (shipping) printHandwrittenWithChildren(shippingChunks, handwrittenTotal);

    if (accounting || shipping || coreDeposit) printQue();
  };

  const printHandwrittenOnlyItems = async (chunks: any[][], handwrittenTotal: string, hasCore: boolean) => {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const args = {
        billToCompany: handwritten?.billToCompany ?? '',
        billToAddress: handwritten?.billToAddress ?? '',
        billToAddress2: handwritten?.billToAddress2 ?? '',
        billToCity: handwritten?.billToCity ?? '',
        billToState: handwritten?.billToState ?? '',
        billToZip: handwritten?.billToZip ?? '',
        billToCountry: handwritten?.billToCountry ?? '',
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ?? '',
        shipToCity: handwritten?.shipToCity ?? '',
        shipToState: handwritten?.shipToState ?? '',
        shipToZip: handwritten?.shipToZip ?? '',
        shipToContact: handwritten?.shipToContact ?? '',
        shipToCountry: '',
        accountNum: handwritten?.thirdPartyAccount ?? '',
        paymentType: handwritten?.payment ?? '',
        createdBy: handwritten?.createdBy ?? '',
        soldBy: handwritten?.soldBy ?? '',
        legacyId: handwritten?.legacyId ?? '',
        handwrittenId: Number(handwritten?.id),
        date: formatDate(handwritten?.date) ?? '',
        contactName: handwritten?.contactName ?? '',
        poNum: handwritten?.poNum ?? '',
        shipVia: handwritten?.shipVia?.name ?? '',
        source: handwritten?.source ?? '',
        invoiceNotes: handwritten?.orderNotes ? handwritten?.orderNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        shippingNotes: handwritten?.shippingNotes ? handwritten?.shippingNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        mp: `${!handwritten?.isBlindShipment ? handwritten?.mp ?? 0 : 0}`,
        cap: `${!handwritten?.isBlindShipment ? handwritten?.cap ?? 0 : 0}`,
        br: `${!handwritten?.isBlindShipment ? handwritten?.br ?? 0 : 0}`,
        fl: `${!handwritten?.isBlindShipment ? handwritten?.fl ?? 0 : 0}`,
        setup: handwritten?.isSetup ?? false,
        taxable: handwritten?.isTaxable ?? false,
        blind: handwritten?.isBlindShipment ?? false,
        npi: handwritten?.isNoPriceInvoice ?? false,
        collect: handwritten?.isCollect ?? false,
        thirdParty: handwritten?.isThirdParty ?? false,
        contactPhone: handwritten?.phone ?? '',
        email: handwritten?.email ?? '',
        ccNumber: handwritten?.ccNumber ?? '',
        handwrittenTotal,
        items: chunk.map((item) => ({
          stockNum: item.stockNum ?? '',
          location: item.location ?? '',
          cost: formatCurrency(item.cost) ?? '$0.00',
          qty: item.qty,
          partNum: item.partNum ?? '',
          desc: item.desc ?? '',
          unitPrice: formatCurrency(item.unitPrice ?? 0) ?? '$0.00',
          total: formatCurrency((item.qty ?? 0) * (item.unitPrice ?? 0)) ?? '$0.00',
          itemChildren: item.invoiceItemChildren
        })) || []
      };

      addToQue('handwrittenAcct', 'print_accounting_handwritten', { ...args, items: args.items }, '1100px', '816px', null, `accounting_handwritten_${i}`);
      if (hasCore) addToQue('handwrittenCore', 'print_core_handwritten', args, '1100px', '816px', null, `core_handwritten_${i}`);
    }
    printQue();
  };

  const printHandwrittenWithChildren = async (chunks: any[][], handwrittenTotal: string) => {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const args = {
        billToCompany: handwritten?.billToCompany ?? '',
        billToAddress: handwritten?.billToAddress ?? '',
        billToAddress2: handwritten?.billToAddress2 ?? '',
        billToCity: handwritten?.billToCity ?? '',
        billToState: handwritten?.billToState ?? '',
        billToZip: handwritten?.billToZip ?? '',
        billToCountry: handwritten?.billToCountry ?? '',
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ?? '',
        shipToCity: handwritten?.shipToCity ?? '',
        shipToState: handwritten?.shipToState ?? '',
        shipToZip: handwritten?.shipToZip ?? '',
        shipToContact: handwritten?.shipToContact ?? '',
        shipToCountry: '',
        accountNum: handwritten?.thirdPartyAccount ?? '',
        paymentType: handwritten?.payment ?? '',
        createdBy: handwritten?.createdBy ?? '',
        soldBy: handwritten?.soldBy ?? '',
        legacyId: handwritten?.legacyId ?? '',
        handwrittenId: Number(handwritten?.id),
        date: formatDate(handwritten?.date) ?? '',
        contactName: handwritten?.contactName ?? '',
        poNum: handwritten?.poNum ?? '',
        shipVia: handwritten?.shipVia?.name ?? '',
        source: handwritten?.source ?? '',
        invoiceNotes: handwritten?.orderNotes ? handwritten?.orderNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        shippingNotes: handwritten?.shippingNotes ? handwritten?.shippingNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        mp: `${!handwritten?.isBlindShipment ? handwritten?.mp ?? 0 : 0}`,
        cap: `${!handwritten?.isBlindShipment ? handwritten?.cap ?? 0 : 0}`,
        br: `${!handwritten?.isBlindShipment ? handwritten?.br ?? 0 : 0}`,
        fl: `${!handwritten?.isBlindShipment ? handwritten?.fl ?? 0 : 0}`,
        setup: handwritten?.isSetup ?? false,
        taxable: handwritten?.isTaxable ?? false,
        blind: handwritten?.isBlindShipment ?? false,
        npi: handwritten?.isNoPriceInvoice ?? false,
        collect: handwritten?.isCollect ?? false,
        thirdParty: handwritten?.isThirdParty ?? false,
        contactPhone: handwritten?.phone ?? '',
        email: handwritten?.email ?? '',
        ccNumber: handwritten?.ccNumber ?? '',
        handwrittenTotal,
        items: chunk.map((item) => ({
          stockNum: item.stockNum ?? '',
          location: item.location ?? '',
          cost: formatCurrency(item.cost) ?? '$0.00',
          qty: item.qty,
          partNum: item.partNum ?? '',
          desc: item.desc ?? '',
          unitPrice: formatCurrency(item.unitPrice ?? 0) ?? '$0.00',
          total: formatCurrency((item.qty ?? 0) * (item.unitPrice ?? 0)) ?? '$0.00',
          itemChildren: item.invoiceItemChildren
        })) || []
      };

      addToQue('handwrittenShip', 'print_shipping_handwritten', { ...args, items: chunks[i] }, '1100px', '816px', null, `shipping_handwritten_${i}`);
    }
    printQue();
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
