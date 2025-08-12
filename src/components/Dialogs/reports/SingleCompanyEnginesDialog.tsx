import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import CustomerDropdownId from "@/components/Library/Dropdown/CustomerDropdownId";
import Input from "@/components/Library/Input";
import { reportSingleCompanyEngines } from "@/scripts/services/reportsService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: SingleCompanyEngines[]) => void
}


export default function SingleCompanyEnginesDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [customerId, setCustomerId] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = async () => {
    openTable();
    setOpen(false);
    const res = await reportSingleCompanyEngines(customerId, startDate, endDate);
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
        <CustomerDropdownId
          label="Company"
          variant={['label-full-width', 'no-margin', 'label-inline', 'label-stack']}
          maxHeight="10rem"
          value={customerId}
          onChange={(id: number) => setCustomerId(id)}
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
