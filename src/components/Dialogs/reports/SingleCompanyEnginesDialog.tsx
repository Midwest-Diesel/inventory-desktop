import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { reportSingleCompanyEngines } from "@/scripts/controllers/reportsController";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setTableOpen: (open: boolean) => void
  setTableData: (data: SingleCompanyEngines[]) => void
  setReportsOpen: (open: boolean) => void
}


export default function SingleCompanyEnginesDialog({ open, setOpen, setTableOpen, setTableData, setReportsOpen }: Props) {
  const [customer, setCustomer] = useState('');
  const [startDate, setStartDate] = useState<Date>(null);
  const [endDate, setEndDate] = useState<Date>(null);

  const handleSearch = async () => {
    setTableOpen(true);
    setReportsOpen(false);
    setOpen(false);
    const res = await reportSingleCompanyEngines(customer, startDate, endDate);
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Single Company/Engines"
      width={500}
      height={312}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <Input
          label="Company"
          variant={['label-stack']}
          value={customer}
          onChange={(e: any) => setCustomer(e.target.value)}
        />
        <Input
          label="Start Date"
          variant={['label-stack']}
          type="date"
          value={parseDateInputValue(startDate)}
          onChange={(e: any) => setStartDate(new Date(e.target.value))}
          required
        />
        <Input
          label="End Date"
          variant={['label-stack']}
          type="date"
          value={parseDateInputValue(endDate)}
          onChange={(e: any) => setEndDate(new Date(e.target.value))}
          required
        />

        <div className="form__footer">
          <Button type="submit">Search</Button>
        </div>
      </form>
    </Dialog>
  );
}
