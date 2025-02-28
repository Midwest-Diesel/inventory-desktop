import Input from "@/components/Library/Input";
import Dialog from "../../Library/Dialog";
import { FormEvent, useState } from "react";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import { invoke } from "@/scripts/config/tauri";
import { isDateInCurrentOrNextWeek } from "@/scripts/tools/utils";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import { getFreightCarrierFromShipVia } from "@/scripts/controllers/handwrittensController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwrittenItems: HandwrittenItem[]
  newShippingListRow: Handwritten
}


export default function ShippingListDialog({ open, setOpen, handwrittenItems, newShippingListRow }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [isCondensed, setIsCondensed] = useState(handwrittenItems.length > 2);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const shipType = await getFreightCarrierFromShipVia(newShippingListRow.shipVia);
    const path = (isDateInCurrentOrNextWeek(date) === 'current' ?
      '\\\\MWD1-SERVER/Server/shipping_list_current_week.xlsx'
      :
      '\\\\MWD1-SERVER/Server/shipping_list_next_week.xlsx'
    );
    if (isCondensed) {
      const weight = handwrittenItems.reduce((arr, item) => arr + item.weight, 0);
      const { length, width, height } = handwrittenItems[0];
      const new_shipping_list_row = {
        handwritten_id: Number(newShippingListRow.id),
        initials: newShippingListRow.createdBy,
        ship_via: newShippingListRow.shipVia,
        ship_type: shipType,
        customer: newShippingListRow.customer.company,
        attn_to: '',
        part_num: 'Multiple',
        desc: desc,
        stock_num: 'See Yellow',
        location: 'See Yellow',
        mp: newShippingListRow.mp,
        br: newShippingListRow.br,
        cap: newShippingListRow.cap,
        fl: newShippingListRow.fl,
        pulled: false,
        packaged: false,
        gone: false,
        ready: false,
        weight: weight || 0,
        dims: `${length}x${width}x${height}`,
        day: date.getDay(),
        list_path: path
      };
      await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
    } else {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const { length, width, height } = handwrittenItems[i];
        const new_shipping_list_row = {
          handwritten_id: Number(newShippingListRow.id),
          initials: newShippingListRow.createdBy,
          ship_via: newShippingListRow.shipVia,
          ship_type: shipType,
          customer: newShippingListRow.customer.company,
          attn_to: '',
          part_num: handwrittenItems[i].partNum,
          desc: handwrittenItems[i].desc,
          stock_num: handwrittenItems[i].stockNum,
          location: handwrittenItems[i].location,
          mp: newShippingListRow.mp,
          br: newShippingListRow.br,
          cap: newShippingListRow.cap,
          fl: newShippingListRow.fl,
          pulled: false,
          packaged: false,
          gone: false,
          ready: false,
          weight: handwrittenItems[i].weight || 0,
          dims: `${length}x${width}x${height}`,
          day: date.getDay(),
          list_path: path
        };
        await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
      }
    }
    setLoading(false);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add to Shipping List"
      maxHeight="28rem"
      width={370}
      y={-150}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Date"
          value={parseDateInputValue(date)}
          type="date"
          onChange={(e: any) => {
            const [year, month, day] = e.target.value.split('-');
            setDate(new Date(Number(year), Number(month) - 1, Number(day)));
          }}          
          required
        />
        {handwrittenItems.length > 2 &&
          <Checkbox
            variant={['label-fit']}
            label="Is Condensed"
            checked={isCondensed}
            onChange={(e: any) => setIsCondensed(e.target.checked)}
          />
        }
        {isCondensed &&
          <Input
            label="Description"
            value={desc}
            onChange={(e: any) => setDesc(e.target.value)}
            required
          />
        }
        
        <div className="form__footer">
          {loading ?
            <Loading />
            :
            <Button type="submit">Submit</Button>
          }
        </div>
      </form>
    </Dialog>
  );
}
