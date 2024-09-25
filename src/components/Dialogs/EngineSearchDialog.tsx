import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";


interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  engines: Engine[]
  setEngines: (engines: Engine[]) => void
}

export default function EngineSearchDialog({ open, setOpen, engines, setEngines }: Props) {
  const [stockNum, setStockNum] = useState('');

  const clearInputs = () => {
    setStockNum('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const results = searchEngines();
    setEngines(results);
  };

  const searchEngines  = () => {
    if (!stockNum) return engines;
    if (stockNum.includes('*')) {
      return engines.filter((engine: Engine) => engine.stockNum.toString().includes(stockNum.replace('*', '')));
    } else {
      return engines.filter((engine: Engine) => engine.stockNum.toString() === stockNum);
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Engines Search"
      width={400}
      height={520}
      className="engines-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
