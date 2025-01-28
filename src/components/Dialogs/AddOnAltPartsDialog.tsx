import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import { getAutofillPart, getPartsInfoByPartNum } from "@/scripts/controllers/partsController";
import Input from "../Library/Input";
import Button from "../Library/Button";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  addOn: AddOn
}


export default function AddOnAltPartsDialog({ open, setOpen, addOn }: Props) {
  const [autofillPartNum, setAutofillPartNum] = useState('');
  const [addOnPartNum, setAddOnPartNum] = useState<string>(addOn.partNum);
  const [partNum, setPartNum] = useState('');
  const [alts, setAlts] = useState<string[]>([]);

  const autofillFromPartNum = async (partNum: string) => {
    if (!partNum) {
      setAutofillPartNum('');
      return;
    }
    const autofill = await getAutofillPart(partNum);
    setAutofillPartNum(autofill);
  };

  const handleNewAlt = async (e: FormEvent) => {
    e.preventDefault();
    const res = (await getPartsInfoByPartNum(partNum))[0];
    if (!res || alts.some((alt: string) => alt === res.altParts)) return;
    setAlts([...alts, res.altParts]);
    setPartNum('');
  };

  const handleSave = () => {
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Alt Parts"
      width={500}
      y={-200}
      x={800}
      maxHeight="29rem"
      className="addon-alt-parts-dialog"
    >
      <form onSubmit={handleNewAlt}>
        <h2>{ addOnPartNum }</h2>
        <ul>
          <li>{ addOnPartNum }</li>
          {alts.map((alt) => {
            return (
              <li key={alt}>
                <div className="addon-alt-parts-dialog__list-item">
                  { alt }
                  <Button variant={['x-small', 'red-color']}>X</Button>
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
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Dialog>
  );
}
