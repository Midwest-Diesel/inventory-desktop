import Input from "@/components/Library/Input";
import Dialog from "../../Library/Dialog";
import { FormEvent, useState } from "react";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import { invoke } from "@tauri-apps/api/tauri";
import { isDateInCurrentOrNextWeek } from "@/scripts/tools/utils";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwrittenItems: HandwrittenItem[]
  newShippingListRow: Handwritten
}


export default function ShippingListDialog({ open, setOpen, handwrittenItems, newShippingListRow }: Props) {
  const [date, setDate] = useState<Date>(new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })));
  const [isCondensed, setIsCondensed] = useState(handwrittenItems.length > 2);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = (isDateInCurrentOrNextWeek(date) === 'current' ?
      'C:/Users/BennettSmrdel/Desktop/shipping_list_current_week.xlsx'
    :
      'C:/Users/BennettSmrdel/Desktop/shipping_list_next_week.xlsx'
    );
    if (isCondensed) {
      const new_shipping_list_row = {
        handwritten_id: Number(newShippingListRow.id),
        initials: newShippingListRow.initials,
        ship_via: newShippingListRow.shipVia,
        ship_type: 'Misc',
        customer: newShippingListRow.customer.company,
        attn_to: '',
        part_num: 'Multiple',
        desc: desc,
        stock_num: 'See Yellow',
        location: 'See Yellow',
        mp: 0,
        br: 0,
        cap: 0,
        fl: 0,
        pulled: false,
        packaged: false,
        gone: false,
        ready: false,
        weight: 0,
        dims: '',
        day: date.getDay(),
        list_path: path
      };
      await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
    } else {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const new_shipping_list_row = {
          handwritten_id: Number(newShippingListRow.id),
          initials: newShippingListRow.initials,
          ship_via: newShippingListRow.shipVia,
          ship_type: 'Misc',
          customer: newShippingListRow.customer.company,
          attn_to: '',
          part_num: handwrittenItems[i].partNum,
          desc: handwrittenItems[i].desc,
          stock_num: handwrittenItems[i].stockNum,
          location: handwrittenItems[i].location,
          mp: 0,
          br: 0,
          cap: 0,
          fl: 0,
          pulled: false,
          packaged: false,
          gone: false,
          ready: false,
          weight: 0,
          dims: '',
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
          onChange={(e: any) => setDate(new Date(new Date(e.target.value).toLocaleString('en-US', { timeZone: 'America/Chicago' })))}
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
