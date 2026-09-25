import Input from "@/components/library/Input";
import { FormEvent, useEffect, useState } from "react";
import { formatWeightDims, parseDateInputValue } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/library/Checkbox";
import Button from "@/components/library/Button";
import Loading from "@/components/library/Loading";
import { getHandwrittenById } from "@/scripts/services/handwrittensService";
import Modal from "@/components/library/Modal";
import { addShippingListRow } from "@/scripts/services/shippingListService";
import { getImagesFromPart } from "@/scripts/services/imagesService";

interface Props {
  open?: boolean
  onNext?: () => void
  onPrev?: () => void
  onClose?: () => void
  handwrittenItems: HandwrittenItem[]
  newShippingListRow: Handwritten | null
}


export default function ShippingListModal({ open, onNext, onPrev, handwrittenItems, newShippingListRow }: Props) {
  const checkIsCondensed = handwrittenItems.filter((i) => !['FREIGHT', 'TAX', 'CORE DEPOSIT', 'CORE DEPOSIT PRIORITY', 'FEE'].includes(i.partNum ?? '')).length > 2;
  const [handwritten, setHandwritten] = useState<Handwritten | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isCondensed, setIsCondensed] = useState(checkIsCondensed);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !newShippingListRow) return;
    const fetchData = async () => {
      const res = await getHandwrittenById(newShippingListRow.id);
      setHandwritten(res);
    };
    fetchData();

    setIsCondensed(checkIsCondensed);
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isCondensed) {
      const weight = handwrittenItems.reduce((arr, item) => arr + item.weight, 0);
      const { length, width, height } = handwrittenItems[0];
      const pics = await getImagesFromPart(handwrittenItems[0].partNum);
      const weightDims = formatWeightDims([{
        type: 'Small Pack',
        qty: 1,
        lbs: weight,
        length,
        width,
        height
      }]);
      const row = {
        handwrittenId: Number(handwritten?.id),
        date,
        createdBy: handwritten?.createdBy ?? '',
        shipVia: handwritten?.shipVia?.name ?? '',
        customer: `${handwritten?.customer.company}${handwritten?.billToCompany !== handwritten?.shipToCompany ? ` / ${handwritten?.shipToCompany}` : '' }`,
        shipToContact: handwritten?.shipToContact ?? '',
        partNum: 'Multiple',
        desc,
        stockNum: 'See Yellow',
        location: 'See Yellow',
        mp: handwritten?.isBlindShipment ? 0 : (handwritten?.mp ?? 0),
        br: handwritten?.isBlindShipment ? 0 : (handwritten?.br ?? 0),
        cap: handwritten?.isBlindShipment ? 0 : (handwritten?.cap ?? 0),
        fl: handwritten?.isBlindShipment ? 0 : (handwritten?.fl ?? 0),
        marketingContact: null,
        pulled: false,
        packaged: false,
        gone: false,
        ready: false,
        weightDims,
        scheduled: null,
        isBlind: Boolean(handwritten?.isBlindShipment),
        isMissingPartPhotos: pics.length === 0
      };

      await addShippingListRow(row);
    } else {
      for (let i = 0; i < handwrittenItems.length; i++) {
        if (['FREIGHT', 'TAX', 'CORE DEPOSIT', 'CORE DEPOSIT PRIORITY', 'FEE'].includes(handwrittenItems[i].partNum ?? '')) continue;
        const { length, width, height } = handwrittenItems[i];
        const qty = Number(handwrittenItems[i].qty);
        const pics = await getImagesFromPart(handwrittenItems[i].partNum);
        const weightDims = formatWeightDims([{
          type: 'Small Pack',
          qty: 1,
          lbs: handwrittenItems[i].weight || 0,
          length,
          width,
          height
        }]);
        const row = {
          handwrittenId: Number(handwritten?.id),
          date,
          createdBy: handwritten?.createdBy ?? '',
          shipVia: handwritten?.shipVia?.name ?? '',
          customer: `${handwritten?.customer.company}${handwritten?.billToCompany !== handwritten?.shipToCompany ? ` / ${handwritten?.shipToCompany}` : '' }`,
          shipToContact: handwritten?.shipToContact ?? '',
          partNum: handwrittenItems[i].partNum,
          desc: qty > 1 ? `${qty} ${handwrittenItems[i].desc}` : handwrittenItems[i].desc,
          stockNum: handwrittenItems[i].stockNum,
          location: handwrittenItems[i].location,
          mp: handwritten?.isBlindShipment ? 0 : (handwritten?.mp ?? 0),
          br: handwritten?.isBlindShipment ? 0 : (handwritten?.br ?? 0),
          cap: handwritten?.isBlindShipment ? 0 : (handwritten?.cap ?? 0),
          fl: handwritten?.isBlindShipment ? 0 : (handwritten?.fl ?? 0),
          marketingContact: null,
          pulled: false,
          packaged: false,
          gone: false,
          ready: false,
          weightDims,
          scheduled: null,
          isBlind: Boolean(handwritten?.isBlindShipment),
          isMissingPartPhotos: pics.length === 0
        };

        await addShippingListRow(row);
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
          onChange={(e) => {
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
            onChange={(e) => setIsCondensed(e.target.checked)}
          />
        }
        {isCondensed &&
          <>
            <br />
            <Input
              variant={['label-bold']}
              label="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
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
