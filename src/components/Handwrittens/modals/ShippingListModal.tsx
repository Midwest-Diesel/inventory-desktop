import Input from "@/components/library/Input";
import { FormEvent, useEffect, useState } from "react";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/library/Checkbox";
import { invoke } from "@/scripts/config/tauri";
import { isDateInCurrentOrNextWeek } from "@/scripts/tools/utils";
import Button from "@/components/library/Button";
import Loading from "@/components/library/Loading";
import { getHandwrittenById } from "@/scripts/services/handwrittensService";
import { getImagesFromPart } from "@/scripts/services/imagesService";
import Modal from "@/components/library/Modal";

interface Props {
  open?: boolean
  onNext?: () => void
  onPrev?: () => void
  onClose?: () => void
  handwrittenItems: HandwrittenItem[]
  newShippingListRow: Handwritten | null
}


const CURRENT_WEEK_FILENAME = import.meta.env.PROD ? 'Shipping List (Current Week).xlsx' : 'shipping_list_current_week.xlsx';
const NEXT_WEEK_FILENAME = import.meta.env.PROD ? 'Shipping List (Next Week).xlsx' : 'shipping_list_next_week.xlsx';

export default function ShippingListModal({ open, onNext, onPrev, handwrittenItems, newShippingListRow }: Props) {
  const [handwritten, setHandwritten] = useState<Handwritten | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isCondensed, setIsCondensed] = useState(handwrittenItems.filter((i) => ['FREIGHT', 'TAX', 'CORE DEPOSIT'].includes(i.partNum ?? '')).length > 2);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !newShippingListRow) return;
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
      `\\\\MWD1-SERVER/Server/${CURRENT_WEEK_FILENAME}`
      :
      `\\\\MWD1-SERVER/Server/${NEXT_WEEK_FILENAME}`
    );
    if (isCondensed) {
      const weight = handwrittenItems.reduce((arr, item) => arr + item.weight, 0);
      const { length, width, height, partNum } = handwrittenItems[0];
      const pics = await getImagesFromPart(partNum ?? '');
      const new_shipping_list_row = {
        handwritten_id: Number(handwritten?.id),
        initials: handwritten?.createdBy ?? '',
        ship_via: handwritten?.shipVia?.name ?? '',
        ship_type: handwritten?.shipVia?.type ?? '',
        customer: `${handwritten?.customer.company}${handwritten?.billToCompany !== handwritten?.shipToCompany ? ` / ${handwritten?.shipToCompany}` : '' }`,
        attn_to: handwritten?.shipToContact ?? '',
        part_num: 'Multiple',
        desc: desc,
        stock_num: 'See Yellow',
        location: 'See Yellow',
        mp: handwritten?.isBlindShipment ? 0 : handwritten?.mp,
        br: handwritten?.isBlindShipment ? 0 : handwritten?.br,
        cap: handwritten?.isBlindShipment ? 0 : handwritten?.cap,
        fl: handwritten?.isBlindShipment ? 0 : handwritten?.fl,
        pulled: false,
        packaged: false,
        gone: false,
        ready: false,
        weight: weight || 0,
        dims: `${length || 0}x${width || 0}x${height || 0}`,
        day: date.getDay(),
        list_path: path,
        has_pics: pics.length > 0,
        is_blind: handwritten?.isBlindShipment ? true : false
      };
      await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
    } else {
      for (let i = 0; i < handwrittenItems.length; i++) {
        if (['FREIGHT', 'TAX', 'CORE DEPOSIT', 'CORE DEPOSIT PRIORITY', 'FEE'].includes(handwrittenItems[i].partNum ?? '')) continue;
        const { length, width, height, partNum } = handwrittenItems[i];
        const pics = await getImagesFromPart(partNum ?? '');
        const new_shipping_list_row = {
          handwritten_id: Number(handwritten?.id),
          initials: handwritten?.createdBy ?? '',
          ship_via: handwritten?.shipVia?.name ?? '',
          ship_type: handwritten?.shipVia?.type ?? '',
          customer: `${handwritten?.customer.company}${handwritten?.billToCompany !== handwritten?.shipToCompany ? ` / ${handwritten?.shipToCompany}` : '' }`,
          attn_to: handwritten?.shipToContact ?? '',
          part_num: handwrittenItems[i].partNum,
          desc: handwrittenItems[i].desc,
          stock_num: handwrittenItems[i].stockNum,
          location: handwrittenItems[i].location,
          mp: handwritten?.isBlindShipment ? 0 : handwritten?.mp,
          br: handwritten?.isBlindShipment ? 0 : handwritten?.br,
          cap: handwritten?.isBlindShipment ? 0 : handwritten?.cap,
          fl: handwritten?.isBlindShipment ? 0 : handwritten?.fl,
          pulled: false,
          packaged: false,
          gone: false,
          ready: false,
          weight: handwrittenItems[i].weight || 0,
          dims: `${length || 0}x${width || 0}x${height || 0}`,
          day: date.getDay(),
          list_path: path,
          has_pics: pics.length > 0,
          is_blind: handwritten?.isBlindShipment ? true : false
        };
        await invoke('add_to_shipping_list', { newShippingListRow: new_shipping_list_row });
      }
    }
    setLoading(false);
    if (onNext) onNext();
  };


  return (
    <Modal
      open={open}
      title="Add to Shipping List"
      width={370}
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
            <>
              { onPrev && <Button onClick={onPrev}>Back</Button> }
              <Button onClick={onNext}>Skip</Button>
              <Button type="submit" data-testid="shipping-list-submit-btn">Next</Button>
            </>
          }
        </div>
      </form>
    </Modal>
  );
}
