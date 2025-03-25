import Input from "@/components/Library/Input";
import Dialog from "../../Library/Dialog";
import { FormEvent, useEffect, useState } from "react";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import { invoke } from "@/scripts/config/tauri";
import { isDateInCurrentOrNextWeek } from "@/scripts/tools/utils";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import { getHandwrittenById } from "@/scripts/controllers/handwrittensController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwrittenItems: HandwrittenItem[]
  newShippingListRow: Handwritten
  setIsEditing: (value: boolean) => void
}


export default function ShippingListDialog({ open, setOpen, handwrittenItems, newShippingListRow, setIsEditing }: Props) {
  const [handwritten, setHandwritten] = useState<Handwritten>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isCondensed, setIsCondensed] = useState(handwrittenItems.length > 2);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      const res = await getHandwrittenById(newShippingListRow.id);
      setHandwritten(res);
    };
    fetchData();
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = (isDateInCurrentOrNextWeek(date) === 'current' ?
      '\\\\MWD1-SERVER/Server/shipping_list_current_week.xlsx'
      :
      '\\\\MWD1-SERVER/Server/shipping_list_next_week.xlsx'
    );
    if (isCondensed) {
      const weight = handwrittenItems.reduce((arr, item) => arr + item.weight, 0);
      const { length, width, height } = handwrittenItems[0];
      const new_shipping_list_row = {
        handwritten_id: Number(handwritten.id),
        initials: handwritten.createdBy || '',
        ship_via: handwritten.shipVia ? handwritten.shipVia.name : '',
        ship_type: handwritten.shipVia ? handwritten.shipVia.type : '',
        customer: handwritten.customer.company,
        attn_to: handwritten.shipToContact || '',
        part_num: 'Multiple',
        desc: desc,
        stock_num: 'See Yellow',
        location: 'See Yellow',
        mp: handwritten.mp,
        br: handwritten.br,
        cap: handwritten.cap,
        fl: handwritten.fl,
        pulled: false,
        packaged: false,
        gone: false,
        ready: false,
        weight: weight || 0,
        dims: `${length || 0}x${width || 0}x${height || 0}`,
        day: date.getDay(),
        list_path: path
      };
      await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
    } else {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const { length, width, height } = handwrittenItems[i];
        const new_shipping_list_row = {
          handwritten_id: Number(handwritten.id),
          initials: handwritten.createdBy || '',
          ship_via: handwritten.shipVia ? handwritten.shipVia.name : '',
          ship_type: handwritten.shipVia ? handwritten.shipVia.type : '',
          customer: handwritten.customer.company,
          attn_to: handwritten.shipToContact || '',
          part_num: handwrittenItems[i].partNum,
          desc: handwrittenItems[i].desc,
          stock_num: handwrittenItems[i].stockNum,
          location: handwrittenItems[i].location,
          mp: handwritten.mp,
          br: handwritten.br,
          cap: handwritten.cap,
          fl: handwritten.fl,
          pulled: false,
          packaged: false,
          gone: false,
          ready: false,
          weight: handwrittenItems[i].weight || 0,
          dims: `${length || 0}x${width || 0}x${height || 0}`,
          day: date.getDay(),
          list_path: path
        };
        await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
      }
    }
    setLoading(false);
    setOpen(false);
    setIsEditing(false);
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
          variant={['label-bold']}
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
            variant={['label-bold', 'label-align-center']}
            label="Description Condensed"
            checked={isCondensed}
            onChange={(e: any) => setIsCondensed(e.target.checked)}
          />
        }
        {isCondensed &&
          <>
            <br />
            <Input
              variant={['label-bold']}
              label="Description"
              value={desc}
              onChange={(e: any) => setDesc(e.target.value)}
              required
            />
          </>
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
