import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import { reportBootsList } from "@/scripts/services/reportsService";
import { FormEvent, useState } from "react";
import * as XLSX from "xlsx";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: BootsListReport[]) => void
}


export default function BootsListDialog({ open, setOpen, openTable, setTableData }: Props) {
  const [list, setList] = useState<[string, string, number][]>([]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    openTable();
    setOpen(false);

    const res = await reportBootsList(list);
    setTableData(res);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files ?? [])[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: [string, string, number][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setList(jsonData
        .map((row, i) => {
          if (i === 0) return null;
          return row;
        })
        .filter(Boolean) as [string, string, number][]
      );
    };
    reader.readAsArrayBuffer(file);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Boots List"
      width={400}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={onSubmit}>
        <Input
          label="Upload List"
          variant={['label-bold']}
          accept=".xlsx,.xls"
          type="file"
          onChange={(e: any) => handleFile(e)}
        />

        <br />
        <div className="form__footer">
          <Button type="submit">Get Results</Button>
        </div>
      </form>
    </Dialog>
  );
}
