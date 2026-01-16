import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../library/Dialog";
import { getPartInfoByPartNum } from "@/scripts/services/partsService";
import Input from "../../library/Input";
import Button from "../../library/Button";
import { editAddOnAltParts } from "@/scripts/services/addOnsService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  addOn: AddOn | null
  partNumList: string[]
}


export default function AddOnAltPartsDialog({ open, setOpen, addOn, partNumList }: Props) {
  const [autofillPartNum, setAutofillPartNum] = useState('');
  const [partNum, setPartNum] = useState('');
  const [alts, setAlts] = useState<string[]>(addOn?.altParts ?? []);

  useEffect(() => {
    setAlts(addOn?.altParts ?? []);
  }, [partNumList]);

  const autofillFromPartNum = (partNum: string) => {
    if (!partNum) {
      setAutofillPartNum('');
    } else {
      setAutofillPartNum(partNumList.find((p) => p.startsWith(partNum)) ?? '');
    }
  };

  const onSubmitNewAlt = async (e: FormEvent) => {
    e.preventDefault();
    if (!addOn || !partNum.trim()) return;
    const res = await getPartInfoByPartNum(partNum);
    const updatedAlts = [...alts, ...res?.altParts.split(', ') ?? [], partNum];
    await editAddOnAltParts(addOn.id, updatedAlts.join(', '));
    setAlts(updatedAlts);
    setPartNum('');
  };

  const onClickRemoveAlt = async (alt: string) => {
    if (!addOn) return;
    const altSet: Set<string> = new Set();
    altSet.add(alt);
    const partsInfo = await getPartInfoByPartNum(alt);
    partsInfo?.altParts.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((a) => altSet.add(a));
    const altsToRemove = Array.from(altSet);
    const updatedAlts = alts.filter((a) => !altsToRemove.includes(a));
    await editAddOnAltParts(addOn.id, updatedAlts.join(', '));
    setAlts(updatedAlts);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Alt Parts"
      width={500}
      x={750}
      y={-150}
      maxHeight="29rem"
      className="addon-alt-parts-dialog"
    >
      <form onSubmit={onSubmitNewAlt}>
        <h2>{ addOn?.partNum }</h2>
        <ul>
          <li>{ addOn?.partNum }</li>
          {alts && alts.map((alt) => {
            return (
              <li key={alt}>
                <div className="addon-alt-parts-dialog__list-item">
                  { alt }
                  <Button variant={['x-small', 'red-color']} type="button" onClick={() => onClickRemoveAlt(alt)}>X</Button>
                </div>
              </li>
            );
          })}
        </ul>

        <Input
          style={{ width: '10rem' }}
          variant={['small', 'autofill-input']}
          value={partNum}
          autofill={autofillPartNum}
          onAutofill={(value) => setPartNum(value)}
          onChange={(e: any) => {
            setPartNum(e.target.value.toUpperCase());
            autofillFromPartNum(e.target.value.toUpperCase());
          }}
        />

        <Button style={{ marginTop: '0.5rem' }} variant={['fit']} type="submit">Add</Button>
      </form>
    </Dialog>
  );
}
