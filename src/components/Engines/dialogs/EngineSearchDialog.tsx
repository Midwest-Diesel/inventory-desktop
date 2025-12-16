import { FormEvent, useEffect, useState } from "react";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Button from "@/components/library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Select from "@/components/library/select/Select";
import { EngineSearch } from "@/scripts/services/enginesService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onSearch: (search: EngineSearch) => void
  listOpen: EngineStatus
  page: number
  limit: number
}


export default function EngineSearchDialog({ open, setOpen, onSearch, listOpen, page, limit }: Props) {
  const [stockNum, setStockNum] = useState('');
  const [model, setModel] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [horsePower, setHorsePower] = useState('');
  const [jakeBrake, setJakeBrake] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [warranty, setWarranty] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [testRun, setTestRun] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [mileage, setMileage] = useState('');
  const [currentStatus, setCurrentStatus] = useState<EngineStatus>(listOpen);
  const statusList: EngineStatus[] = ['RunnerReady', 'RunnerNotReady', 'HoldSoldRunner', 'ToreDown', 'CoreEngine', 'Sold', 'ShortBlock', 'LongBlock'];

  useEffect(() => {
    setCurrentStatus(listOpen);
  }, [listOpen]);

  const clearInputs = () => {
    setStockNum('');
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
    setCurrentStatus(listOpen);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const search = {
      stockNum: Number(stockNum),
      model,
      serialNum,
      date: parseDateInputValue(date),
      location,
      comments,
      horsePower,
      jakeBrake,
      warranty,
      testRun,
      mileage,
      status: currentStatus,
      page,
      limit
    };
    onSearch(search);
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
          value={currentStatus ?? 'RunnerReady'}
          onChange={(e: any) => setCurrentStatus(e.target.value)}
        >
          {statusList.map((status: EngineStatus, i: number) => {
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
