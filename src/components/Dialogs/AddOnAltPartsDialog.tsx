import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import { getPartInfoByPartNum } from "@/scripts/services/partsService";
import Input from "../Library/Input";
import Button from "../Library/Button";
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

  const autofillFromPartNum = (partNum: string) => {
    if (!partNum) {
      setAutofillPartNum('');
    } else {
      setAutofillPartNum(partNumList.find((p) => p.startsWith(partNum)) ?? '');
    }
  };

  const handleNewAlt = async (e: FormEvent) => {
    e.preventDefault();
    if (!addOn || !partNum.trim()) return;
    const res = await getPartInfoByPartNum(partNum);
    if (!res || alts.some((alt: string) => res.altParts.split(', ').includes(alt))) {
      alert('Part number does not exist');
      return;
    }
    const updatedAlts = [...alts, ...res.altParts.split(', ')];
    await editAddOnAltParts(addOn.id, updatedAlts.join(', '));
    setAlts(updatedAlts);
    setPartNum('');
  };

  const handleRemoveAlt = async (alt: string) => {
    if (!addOn) return;
    const updatedAlts = alts.filter((a) => alt !== a);
    await editAddOnAltParts(addOn.id, updatedAlts.join(', '));
    setAlts(updatedAlts);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Alt Parts"
      width={500}
      x={800}
      maxHeight="29rem"
      className="addon-alt-parts-dialog"
    >
      <form onSubmit={handleNewAlt}>
        <h2>{ addOn?.partNum }</h2>
        <ul>
          <li>{ addOn?.partNum }</li>
          {alts && alts.map((alt) => {
            return (
              <li key={alt}>
                <div className="addon-alt-parts-dialog__list-item">
                  { alt }
                  <Button variant={['x-small', 'red-color']} type="button" onClick={() => handleRemoveAlt(alt)}>X</Button>
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
