import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Checkbox from "@/components/Library/Checkbox";
import { useState } from "react";
import Button from "@/components/Library/Button";
import { addReturn, addReturnItems, getSomeReturns } from "@/scripts/controllers/returnsController";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { confirm } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
}


export default function NewReturnDialog({ open, setOpen, handwritten }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [handwrittenItems, setHandwrittenItems] = useState<HandwrittenItem[]>(handwritten.handwrittenItems);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const toggleIsReturn = (index: number) => {
    const newHandwrittenItems = handwrittenItems.map((item, i) => {
      if (i === index) {
        item.return = !item.return;
      }
      return item;
    });
    setHandwrittenItems(newHandwrittenItems);
  };

  const submitNewReturn = async () => {
    if (!await confirm('Are you sure you want to create a new return?')) return;
    const newReturn = {
      customer: handwritten.customer,
      invoiceId: handwritten.id,
      invoiceDate: handwritten.date,
      createdBy: user.initials,
      dateCalled: null,
      dateReceived: null,
      creditIssued: null,
      returnNotes: returnNotes,
      returnReason: returnReason,
      returnPaymentTerms: null,
      restockFee: null,
      billToCompany: handwritten.billToCompany,
      billToAddress: handwritten.billToAddress,
      billToAddress2: handwritten.billToAddress2,
      billToCity: handwritten.billToCity,
      billToState: handwritten.billToState,
      billToZip: handwritten.billToZip,
      billToContact: handwritten.customer.contact,
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
    } as Return;
    await addReturn(newReturn);

    const res = (await getSomeReturns(1, 2))[0] as ReturnItem;
    const newReturnItems = handwrittenItems.map((item) => {
      if (item.return) {
        return {
          returnId: res.id,
          qty: item.qty,
          partNum: item.partNum,
          desc: item.desc,
          cost: item.cost,
          unitPrice: item.unitPrice,
          stockNum: item.stockNum,
          isReturnReceived: false,
          isReturnAsDescribed: false,
          isReturnPutAway: false,
          notes: '',
        } as ReturnItem;
      }
    });
    for (let i = 0; i < newReturnItems.length; i++) {
      await addReturnItems(newReturnItems[i]);
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="New Return"
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
          {handwrittenItems.map((item: HandwrittenItem, i) => {
            return (
              <tr key={i}>
                <td>{ item.stockNum }</td>
                <td>{ item.location }</td>
                <td>{ formatCurrency(item.cost) }</td>
                <td>{ item.qty }</td>
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
        <Button onClick={submitNewReturn}>Submit</Button>
      </div>
    </Dialog>
  );
}
