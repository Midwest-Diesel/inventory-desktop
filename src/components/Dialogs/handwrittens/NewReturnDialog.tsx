import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Checkbox from "@/components/Library/Checkbox";
import { useEffect, useState } from "react";
import Button from "@/components/Library/Button";
import { addReturn, addReturnItem } from "@/scripts/services/returnsService";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { useNavState } from "@/hooks/useNavState";
import { ask } from "@/scripts/config/tauri";
import Input from "@/components/Library/Input";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
}


export default function NewReturnDialog({ open, setOpen, handwritten }: Props) {
  const { push } = useNavState();
  const [user] = useAtom<User>(userAtom);
  const [lineItems, setLineItems] = useState<{ qtyList: number[], handwrittenItems: HandwrittenItem[] }>({ qtyList: [], handwrittenItems: [] });

  useEffect(() => {
    if (!open) return;
    setLineItems({ qtyList: handwritten.handwrittenItems.map((h) => h.qty ?? 0), handwrittenItems: handwritten.handwrittenItems });
  }, [open]);

  const toggleIsReturn = (index: number) => {
    const newHandwrittenItems = lineItems.handwrittenItems.map((item, i) => {
      if (i === index) {
        item.return = !item.return;
      }
      return item;
    });
    setLineItems({ qtyList: lineItems.qtyList, handwrittenItems: newHandwrittenItems });
  };

  const submitNewReturn = async () => {
    if (!lineItems.handwrittenItems.some((i) => i.return) || !await ask('Are you sure you want to create a new return?')) return;
    const newReturn = {
      customer: handwritten.customer,
      handwrittenId: handwritten.id,
      invoiceDate: handwritten.date,
      salesmanId: user.id,
      dateCalled: new Date(),
      dateReceived: null,
      creditIssued: null,
      returnNotes: '',
      returnReason: '',
      returnPaymentTerms: null,
      restockFee: null,
      billToCompany: handwritten.billToCompany,
      billToAddress: handwritten.billToAddress,
      billToAddress2: handwritten.billToAddress2,
      billToCity: handwritten.billToCity,
      billToState: handwritten.billToState,
      billToZip: handwritten.billToZip,
      billToContact: handwritten.contactName,
      billToPhone: handwritten.billToPhone,
      shipToCompany: handwritten.shipToCompany,
      shipToAddress: handwritten.shipToAddress,
      shipToAddress2: handwritten.shipToAddress2,
      shipToCity: handwritten.shipToCity,
      shipToState: handwritten.shipToState,
      shipToZip: handwritten.shipToZip,
      poNum: handwritten.poNum,
      payment: handwritten.payment,
      source: handwritten.source,
      returnItems: [],
      returnPart: null
    } as any;
    const id = await addReturn(newReturn);

    const newReturnItems = lineItems.handwrittenItems.map((item, i) => {
      if (item.return) {
        return {
          returnId: id,
          partId: item.partId,
          qty: lineItems.qtyList[i],
          partNum: item.partNum,
          desc: item.desc,
          cost: item.cost,
          unitPrice: item.unitPrice,
          stockNum: item.stockNum,
          isReturnReceived: false,
          isReturnAsDescribed: false,
          isReturnPutAway: false,
          notes: '',
        } as any;
      }
    });
    for (let i = 0; i < newReturnItems.length; i++) {
      if (newReturnItems[i]) await addReturnItem(newReturnItems[i]);
    }

    await push('Returns', '/returns');
  };

  const editItemQty = (qty: string, index: number) => {
    if (!qty) return;
    const newQtyList = lineItems.qtyList.map((item, i) => {
      if (i === index) return Number(qty);
      return item;
    });
    setLineItems({ qtyList: newQtyList, handwrittenItems: lineItems.handwrittenItems });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="New Return"
      maxHeight="44rem"
      data-testid="new-return-dialog"
    >
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Location</th>
            <th>Cost</th>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Unit Price</th>
            <th>Date</th>
            <th>Add to Return</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.handwrittenItems.map((item: HandwrittenItem, i) => {
            return (
              <tr key={i}>
                <td>{ item.stockNum }</td>
                <td>{ item.location }</td>
                <td>{ formatCurrency(item.cost) }</td>
                <td>
                  <Input
                    variant={['no-style', 'no-arrows']}
                    style={{ color: 'white' }}
                    value={lineItems.qtyList[i]}
                    onChange={(e) => editItemQty(e.target.value, i)}
                    type="number"
                  />
                </td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                <td>{ formatCurrency(item.unitPrice) }</td>
                <td>{ formatDate(item.date) }</td>
                <td className="cbx-td">
                  <Checkbox
                    checked={item.return || false}
                    onChange={() => toggleIsReturn(i)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="form__footer">
        <Button onClick={submitNewReturn} data-testid="submit-btn" disabled={!lineItems.handwrittenItems.some((i) => i.return)}>Submit</Button>
      </div>
    </Dialog>
  );
}
