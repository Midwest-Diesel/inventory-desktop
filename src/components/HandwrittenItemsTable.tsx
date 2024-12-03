import { cap, formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";
import Button from "./Library/Button";
import { addHandwrittenItem } from "@/scripts/controllers/handwrittensController";
import { addCore } from "@/scripts/controllers/coresController";
import HandwrittenChildrenDialog from "./Dialogs/handwrittens/HandwrittenChildrenDialog";
import { useEffect, useState } from "react";
import Toast from "./Library/Toast";
import { confirm } from '@tauri-apps/api/dialog';

interface Props {
  className?: string
  handwritten: Handwritten
  handwrittenItems: HandwrittenItem[]
  setHandwritten: (handwritten: Handwritten) => void
}


export default function HandwrittenItemsTable({ className, handwritten, handwrittenItems, setHandwritten }: Props) {
  const [childrenOpen, setChildrenOpen] = useState(false);
  const [stockNumChildren, setStockNumChildren] = useState<HandwrittenItemChild[]>([]);
  const [msg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const itemsWithChildren = handwrittenItems.filter((item) => item.invoiceItemChildren.length > 0);
    itemsWithChildren.forEach((item) => {
      const res = item.invoiceItemChildren.find((child) => child.cost === 0.04);
      if (res) {
        setToastMsg(`Cost still detected on item <span style="color: var(--orange-1)">${res.partNum}</span>!`);
        setToastOpen(true);
      }
    });
  }, []);

  const getTotalCost = (): number => {
    return handwrittenItems.reduce((acc, item) => item.cost !== 0.04 && item.cost !== 0.01 && acc + (item.cost * item.qty), 0);
  };
  const getInvoiceTotal = (): number => {
    return handwrittenItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  };
  const costColorStyle = getTotalCost() < 0 ? { color: 'var(--red-2)' } : '';
  const totalColorStyle = getInvoiceTotal() < 0 ? { color: 'var(--red-2)' } : '';

  const handleCoreCharge = async (item: HandwrittenItem) => {
    if (!await confirm('Are you sure you want to add a core charge?')) return;
    const newItem = {
      handwrittenId: handwritten.id,
      date: new Date(),
      desc: 'CORE DEPOSIT',
      partNum: item.partNum,
      stockNum: item.stockNum,
      unitPrice: 0,
      qty: item.qty,
      cost: 0.01,
      location: null,
      partId: null,
    } as HandwrittenItem;
    await addHandwrittenItem(newItem);
    
    const priority = cap((prompt('Enter core priority', 'Low') || 'Low').toLowerCase());
    const newCore = {
      date: new Date(),
      qty: item.qty,
      partNum: item.partNum,
      desc: item.desc,
      unitPrice: item.unitPrice,
      customerId: handwritten.customer.id,
      partInvoiceId: item.handwrittenId,
      invoiceId: handwritten.id,
      billToCompany: handwritten.billToCompany,
      shipToCompany: handwritten.shipToCompany,
      charge: item.cost,
      priority,
      salesmanId: handwritten.salesmanId,
    } as Core;
    await addCore(newCore);
    setHandwritten({ ...handwritten, cores: [...handwritten.cores, newCore], handwrittenItems: [...handwritten.handwrittenItems, newItem] });
  };

  const handleOpenStockNums = (children: HandwrittenItemChild[]) => {
    setChildrenOpen(true);
    setStockNumChildren(children);
  };


  return (
    <div className={`handwritten-items-table ${className && className}`}>
      {handwrittenItems &&
        <>
          <Toast msg={msg} type="error" open={toastOpen} setOpen={setToastOpen} duration={6000} />
          <HandwrittenChildrenDialog open={childrenOpen} setOpen={setChildrenOpen} stockNumChildren={stockNumChildren} />

          <p><strong>Cost Total: </strong><span style={{ ...costColorStyle }}>{ formatCurrency(getTotalCost()) }</span></p>
          <p><strong>Invoice Total: </strong><span style={{ ...totalColorStyle }}>{ formatCurrency(getInvoiceTotal()) }</span></p>
          <Table>
            <thead>
              <tr>
                <th></th>
                <th>Stock Number</th>
                <th>Location</th>
                <th>Cost</th>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {handwrittenItems.map((item: HandwrittenItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ !item.desc.includes('CORE DEPOSIT') && <Button variant={['x-small']} onClick={() => handleCoreCharge(item)}>Core Charge</Button> }</td>
                    <td className="handwritten-items-table__stock-num" style={ item.desc.includes('CORE DEPOSIT') ? { color: 'var(--red-2)', fontWeight: 'bold' } : {}}>
                      { item.stockNum }
                      { item.invoiceItemChildren && item.invoiceItemChildren.length > 0 && <Button variant={['x-small']} onClick={() => handleOpenStockNums(item.invoiceItemChildren)}>View</Button> }
                    </td>
                    <td>{ item.location }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                    <td>{ item.qty }</td>
                    <td style={ item.desc.includes('CORE DEPOSIT') ? { color: 'var(--red-2)', fontWeight: 'bold' } : {}}>
                      { item.partNum }
                    </td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.unitPrice) }</td>
                    <td>{ formatDate(item.date) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }
    </div>
  );
}
