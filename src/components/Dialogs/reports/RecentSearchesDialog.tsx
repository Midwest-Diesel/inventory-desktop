import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { reportRecentSearches } from "@/scripts/services/reportsService";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: RecentPartSearch[]) => void
}


export default function RecentSearchesDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [partNum, setPartNum] = useState('');

  const handleSearch = async () => {
    openTable();
    setOpen(false);
    const res = await reportRecentSearches(partNum);
    setTableData(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Recent Searches"
      width={400}
      height={255}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <Input
          label="Part Number"
          variant={['label-stack']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit">Search</Button>
        </div>
      </form>
    </Dialog>
  );
}
