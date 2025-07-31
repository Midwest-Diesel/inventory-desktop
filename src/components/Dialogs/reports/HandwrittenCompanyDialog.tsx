import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import CustomerDropdown from "@/components/Library/Dropdown/CustomerDropdown";
import Input from "@/components/Library/Input";
import CustomerSelect from "@/components/Library/Select/CustomerSelect";
import { reportHandwrittenCompany } from "@/scripts/services/reportsService";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: HandwrittensCompanyReport[]) => void
}


export default function HandwrittenCompanyDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [customer, setCustomer] = useState('');
  const [year, setYear] = useState('');

  const handleSearch = async () => {
    openTable();
    setOpen(false);
    const res = await reportHandwrittenCompany(customer, Number(year));
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Single Company/Handwritten"
      height={255}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <CustomerDropdown
          label="Company"
          variant={['label-full-width', 'label-bold', 'no-margin', 'label-inline', 'label-stack']}
          maxHeight="25rem"
          value={customer}
          onChange={(c) => setCustomer(c)}
        />
        <Input
          label="Year"
          variant={['label-stack']}
          value={year}
          onChange={(e: any) => setYear(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit">Search</Button>
        </div>
      </form>
    </Dialog>
  );
}
