import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { reportSalesByBillToCompany } from "@/scripts/services/reportsService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: SingleCompany[]) => void
}


export default function SalesByBillToCompanyDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [billToCompany, setBillToCompany] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    openTable();
    setOpen(false);
    const res = await reportSalesByBillToCompany(billToCompany, startDate, endDate);
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales by BillToCompany"
      width={500}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <Input
          label="Company"
          variant={['label-stack']}
          value={billToCompany}
          onChange={(e) => setBillToCompany(e.target.value)}
          required
        />
        <Input
          label="Start Date"
          variant={['label-stack']}
          type="date"
          value={parseDateInputValue(startDate)}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          required
        />
        <Input
          label="End Date"
          variant={['label-stack']}
          type="date"
          value={parseDateInputValue(endDate)}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          required
        />

        <div className="form__footer">
          <Button type="submit">Search</Button>
        </div>
      </form>
    </Dialog>
  );
}
