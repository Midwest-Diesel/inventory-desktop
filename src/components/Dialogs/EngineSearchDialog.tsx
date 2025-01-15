import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import { formatDate, parseDateInputValue } from "@/scripts/tools/stringUtils";
import Select from "../Library/Select/Select";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  engines: Engine[]
  setEngines: (engines: Engine[]) => void
}


export default function EngineSearchDialog({ open, setOpen, engines, setEngines }: Props) {
  const [stockNum, setStockNum] = useState<number>('' as any);
  const [model, setModel] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [date, setDate] = useState<Date>(null);
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [horsePower, setHorsePower] = useState('');
  const [jakeBrake, setJakeBrake] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [warranty, setWarranty] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [testRun, setTestRun] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [mileage, setMileage] = useState('');
  const [currentStatus, setCurrentStatus] = useState<EngineStatus | null>(null);
  const statusList: EngineStatus[] = ['ToreDown', 'RunnerReady', 'RunnerNotReady', 'HoldSoldRunner', 'CoreEngine', 'Sold', 'ShortBlock', 'LongBlock'];

  const clearInputs = () => {
    setStockNum('' as any);
    setModel('');
    setSerialNum('');
    setDate(null);
    setLocation('');
    setComments('');
    setHorsePower('');
    setJakeBrake('');
    setWarranty('');
    setTestRun('');
    setMileage('');
    setCurrentStatus(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const results = searchEngines();
    setEngines(results);
  };

  const searchEngines = () => {
    const splitDate = parseDateInputValue(date).split('-');
    const parsedDate = splitDate[0] !== '' as any ? `${splitDate[1]}/${splitDate[2]}/${splitDate[0]}` : '';

    return engines.filter((engine) => {
      if (
        (!stockNum || engine.stockNum === Number(stockNum)) &&
        (!model || model.includes('*') ? engine.model.toUpperCase().includes(model.replace('*', '').toUpperCase()) : engine.model.toUpperCase() === model.toUpperCase()) &&
        (!serialNum || serialNum.includes('*') ? engine.serialNum.toUpperCase().includes(serialNum.replace('*', '').toUpperCase()) : engine.serialNum.toUpperCase() === serialNum.toUpperCase()) &&
        (!parsedDate || formatDate(engine.loginDate) === parsedDate) &&
        (!location || location.includes('*') ? engine.location.toUpperCase().includes(location.replace('*', '').toUpperCase()) : engine.location.toUpperCase() === location.toUpperCase()) &&
        (!comments || comments.includes('*') ? engine.comments.toUpperCase().includes(comments.replace('*', '').toUpperCase()) : engine.comments.toUpperCase() === comments.toUpperCase()) &&
        (!horsePower || horsePower.includes('*') ? engine.horsePower.toUpperCase().includes(horsePower.replace('*', '').toUpperCase()) : engine.horsePower.toUpperCase() === horsePower.toUpperCase()) &&
        (!jakeBrake || (!engine.jakeBrake && jakeBrake === 'FALSE') || (engine.jakeBrake && jakeBrake === 'TRUE')) &&
        (!warranty || (!engine.warranty && warranty === 'FALSE') || (engine.warranty && warranty === 'TRUE')) &&
        (!testRun || (!engine.testRun && testRun === 'FALSE') || (engine.testRun && testRun === 'TRUE')) &&
        (!mileage || mileage.includes('*') ? engine.mileage.toUpperCase().includes(mileage.replace('*', '').toUpperCase()) : engine.mileage.toUpperCase() === mileage.toUpperCase()) &&
        (!currentStatus || engine.currentStatus === currentStatus)
      ) {
        return engine;
      }
    });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Engines Search"
      width={400}
      height={600}
      className="engines-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
          type="number"
        />

        <Input
          label="Model"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={model}
          onChange={(e: any) => setModel(e.target.value)}
        />

        <Input
          label="Serial Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={serialNum}
          onChange={(e: any) => setSerialNum(e.target.value)}
        />

        <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          type="date"
        />

        <Input
          label="Location"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={location}
          onChange={(e: any) => setLocation(e.target.value)}
        />

        <Input
          label="Comments"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={comments}
          onChange={(e: any) => setComments(e.target.value)}
        />

        <Input
          label="HP"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={horsePower}
          onChange={(e: any) => setHorsePower(e.target.value)}
        />

        <Input
          label="Mileage"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={mileage}
          onChange={(e: any) => setMileage(e.target.value)}
        />

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Jake Brake"
          value={jakeBrake}
          onChange={(e: any) => setJakeBrake(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Warranty"
          value={warranty}
          onChange={(e: any) => setWarranty(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Test Run"
          value={testRun}
          onChange={(e: any) => setTestRun(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Current Status"
          value={currentStatus}
          onChange={(e: any) => setCurrentStatus(e.target.value)}
        >
          <option value="">-- SELECT STATUS --</option>
          {statusList.map((status, i) => {
            return <option key={i}>{ status }</option>;
          })}
        </Select>

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
