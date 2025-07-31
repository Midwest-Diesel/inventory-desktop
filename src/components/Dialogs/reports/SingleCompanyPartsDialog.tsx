import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import CustomerDropdown from "@/components/Library/Dropdown/CustomerDropdown";
import Input from "@/components/Library/Input";
import CustomerSelect from "@/components/Library/Select/CustomerSelect";
import { reportSingleCompanyParts } from "@/scripts/services/reportsService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: SingleCompanyParts[]) => void
}


export default function SingleCompanyPartsDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [customer, setCustomer] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = async () => {
    openTable();
    setOpen(false);
    const res = await reportSingleCompanyParts(customer, startDate, endDate);
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Single Company/Parts"
      width={500}
      height={312}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <CustomerDropdown
          label="Company"
          variant={['label-full-width', 'no-margin', 'label-inline', 'label-stack']}
          maxHeight="10rem"
          value={customer}
          onChange={(c: string) => setCustomer(c)}
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
