import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import CustomerDropdownId from "@/components/library/dropdown/CustomerDropdownId";
import Input from "@/components/library/Input";
import { reportHandwrittenCompany } from "@/scripts/services/reportsService";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: HandwrittensCompanyReport[]) => void
}


export default function HandwrittenCompanyDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [customerId, setCustomerId] = useState(0);
  const [year, setYear] = useState('');

  const handleSearch = async () => {
    openTable();
    setOpen(false);
    const res = await reportHandwrittenCompany(customerId, Number(year));
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Handwrittens by Year"
      y={-100}
      height={300}
      width={300}
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
          label="Year"
          variant={['label-stack']}
          value={year}
          onChange={(e: any) => setYear(e.target.value)}
          type="number"
        />

        <div className="form__footer">
          <Button type="submit">Search</Button>
        </div>
      </form>
    </Dialog>
  );
}
