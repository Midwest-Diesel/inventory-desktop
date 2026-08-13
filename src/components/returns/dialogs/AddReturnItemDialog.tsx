import Button from "@/components/library/Button";
import Checkbox from "@/components/library/Checkbox";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Table from "@/components/library/Table";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  items: HandwrittenItem[]
  returnItems: ReturnItem[]
  onSubmit: (items: HandwrittenItem[], qtyList: number[]) => void
}


export default function AddReturnItemDialog({ open, setOpen, items, returnItems, onSubmit }: Props) {
  const [lineItems, setLineItems] = useState<{ qtyList: number[], handwrittenItems: HandwrittenItem[] }>(
    { qtyList: items.map((i) => i.qty ?? 0), handwrittenItems: [] }
  );
  
  useEffect(() => {
    setLineItems({ ...lineItems, handwrittenItems: items.filter((item) => {
      return !returnItems.some((i) => i.stockNum === item.stockNum);
    })});
  }, [items]);

  const toggleIsReturn = (index: number) => {
    const newHandwrittenItems = lineItems.handwrittenItems.map((item, i) => {
      if (i === index) {
        item.return = !item.return;
      }
      return item;
    });
    setLineItems({ qtyList: lineItems.qtyList, handwrittenItems: newHandwrittenItems });
  };

  const editItemQty = (qty: string, index: number) => {
    if (!qty) return;
    const newQtyList = lineItems.qtyList.map((item, i) => {
      if (i === index) return Number(qty);
      return item;
    });
    setLineItems({ qtyList: newQtyList, handwrittenItems: lineItems.handwrittenItems });
  };

  const handleOnSubmit = () => {
    onSubmit(lineItems.handwrittenItems.filter((item) => item.return), lineItems.qtyList);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Items to Return"
      maxHeight="44rem"
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
        <Button
          onClick={handleOnSubmit}
          disabled={!lineItems.handwrittenItems.some((i) => i.return)}
        >
          Submit
        </Button>
      </div>
    </Dialog>
  );
}
