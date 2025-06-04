import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { reportEmails } from "@/scripts/services/reportsService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setTableOpen: (open: boolean) => void
  setTableData: (data: EmailReport[]) => void
  setReportsOpen: (open: boolean) => void
}


export default function EmailsDialog({ open, setOpen, setTableOpen, setTableData, setReportsOpen }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setTableOpen(true);
    setReportsOpen(false);
    setOpen(false);
    const res = await reportEmails(startDate, endDate);
    setTableData(res);
  };
  

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Email Addresses by Date"
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
