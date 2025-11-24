import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "../Library/Table";
import Button from "../Library/Button";
import { getHandwrittenById } from "@/scripts/services/handwrittensService";
import HandwrittenChildrenDialog from "../Dialogs/handwrittens/HandwrittenChildrenDialog";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { quickPickItemIdAtom } from "@/scripts/atoms/state";
import { addCoreCharge, getTaxValue } from "@/scripts/logic/handwrittens";

interface Props {
  className?: string
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten) => void
}


export default function HandwrittenItemsTable({ className, handwritten, setHandwritten }: Props) {
  const [quickPickItemId, setQuickPickItemId] = useAtom<number>(quickPickItemIdAtom);
  const [childrenOpen, setChildrenOpen] = useState(false);
  const [stockNumChildren, setStockNumChildren] = useState<HandwrittenItemChild[]>([]);
  const taxTotal = useMemo(() => getTaxValue(handwritten.handwrittenItems), [handwritten.handwrittenItems]);

  useEffect(() => {
    if (stockNumChildren.length === 0) return;
    setStockNumChildren(handwritten.handwrittenItems.find((item) => item.id === stockNumChildren[0].parentId)?.invoiceItemChildren ?? []);
  }, [handwritten]);

  const textStyles = (item: HandwrittenItem) => {
    const styles = {} as any;
    if (item.location?.includes('CORE DEPOSIT') || item.partNum?.includes('CORE DEPOSIT')) {
      styles.color = 'var(--red-2)';
      styles.fontWeight = 'bold';
    }
    if (item.isTakeoffDone) {
      styles.color = 'var(--yellow-2)';
      styles.fontWeight = 'bold';
    }
    return styles;
  };

  const getTotalCost = (): number => {
    return (handwritten.handwrittenItems as any)
      .reduce((acc: number, item: HandwrittenItem) => item.cost !== 0.04 && item.cost !== 0.01 && acc + ((item.cost ?? 0) * (item.qty ?? 0)), 0);
  };
  const getInvoiceTotal = (): number => {
    return handwritten.handwrittenItems
      .reduce((acc, item) => acc + ((item.unitPrice ?? 0) * (item.qty ?? 0)), 0);
  };
  const costColorStyle = getTotalCost() < 0 ? { color: 'var(--red-2)' } : '';
  const totalColorStyle = getInvoiceTotal() < 0 ? { color: 'var(--red-2)' } : '';

  const handleCoreCharge = async (item: HandwrittenItem) => {
    await addCoreCharge(handwritten, item);
    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
  };

  const handleOpenStockNums = (children: HandwrittenItemChild[]) => {
    setChildrenOpen(true);
    setStockNumChildren(children);
  };

  const toggleQuickPick = (item: HandwrittenItem) => {
    setQuickPickItemId(quickPickItemId ? 0 : item.id);
  };
  

  return (
    <div className={`handwritten-items-table ${className && className}`}>
      {handwritten.handwrittenItems &&
        <>
          <HandwrittenChildrenDialog
            open={childrenOpen}
            setOpen={setChildrenOpen}
            stockNumChildren={stockNumChildren}
            handwritten={handwritten}
            setHandwritten={setHandwritten}
          />

          <p><strong>Invoice Total: </strong><span style={{ ...totalColorStyle }}>{ formatCurrency(getInvoiceTotal()) }</span></p>
          <p><strong>Cost Total: </strong><span style={{ ...costColorStyle }}>{ formatCurrency(getTotalCost()) }</span></p>
          <Table>
            <thead>
              <tr>
                { handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' && <th></th> }
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
              {handwritten.handwrittenItems.map((item: HandwrittenItem, i: number) => {
                return (
                  <tr key={i}>
                    {handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' &&
                      <td>
                        {item.location && !item.location.includes('CORE DEPOSIT') && item.invoiceItemChildren.length === 0 &&
                          <Button
                            variant={['x-small']}
                            onClick={() => handleCoreCharge(item)}
                            data-testid="core-charge-btn"
                          >
                            Core Charge
                          </Button>
                        }
                        {item.invoiceItemChildren.some((i) => i.stockNum === 'In/Out') &&
                          <Button variant={['x-small']} onClick={() => toggleQuickPick(item)}>{ quickPickItemId > 0 ? 'Disable' : 'Enable' } Quick Pick</Button>
                        }
                      </td>
                    }
                    <td className="handwritten-items-table__stock-num" style={ textStyles(item) } data-testid="item-stock-num">
                      { item.stockNum }
                      { item.invoiceItemChildren && item.invoiceItemChildren.length > 0 && <Button variant={['x-small']} onClick={() => handleOpenStockNums(item.invoiceItemChildren)}>View</Button> }
                    </td>
                    <td>{ item.invoiceItemChildren.length === 0 && item.location }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                    <td data-testid="item-qty">{ item.qty }</td>
                    <td style={ textStyles(item) } data-testid="item-part-num">
                      { item.partNum }
                    </td>
                    <td data-testid="item-desc">{ item.desc }</td>
                    <td>{ item.desc === 'TAX' ? formatCurrency(taxTotal) : formatCurrency(Number(item.qty) < 0 ? -Number(item.unitPrice) : item.unitPrice) }</td>
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
