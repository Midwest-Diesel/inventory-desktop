import { FormEvent, useEffect, useState } from "react";
import Dialog from "../Library/Dialog";
import { getPartsInfoByPartNum } from "@/scripts/services/partsService";
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
  const [alts, setAlts] = useState<string[]>([]);
  const [savedBtnText, setSavedBtnText] = useState('Save');

  useEffect(() => {
    if (!open) return;
    setAlts(addOn?.altParts ?? []);
  }, [open]);

  const autofillFromPartNum = (partNum: string) => {
    if (!partNum) {
      setAutofillPartNum('');
    } else {
      setAutofillPartNum(partNumList.find((p) => p.startsWith(partNum)) ?? '');
    }
  };

  const handleNewAlt = async (e: FormEvent) => {
    e.preventDefault();
    const res = (await getPartsInfoByPartNum(partNum))[0];
    if (!res || alts.some((alt: string) => res.altParts.split(', ').includes(alt))) return;
    setAlts([...alts, ...res.altParts.split(', ')]);
    setPartNum('');
  };

  const handleRemoveAlt = (alt: string) => {
    const altParts = alts.filter((a) => alt !== a);
    setAlts(altParts);
  };

  const handleSave = async () => {
    if (!addOn?.id) return;
    setSavedBtnText('Saved!');
    await editAddOnAltParts(addOn.id, alts.join(', '));
    setTimeout(() => setSavedBtnText('Save'), 1000);
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

      <div className="form__footer">
        <Button onClick={handleSave}>{ savedBtnText }</Button>
      </div>
    </Dialog>
  );
}
