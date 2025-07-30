import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { reportAllSources } from "@/scripts/services/reportsService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: AllSourcesReport[]) => void
}


export default function AllSourcesDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    openTable();
    setOpen(false);
    const res = await reportAllSources(startDate, endDate);
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales By Sources"
      width={400}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
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
