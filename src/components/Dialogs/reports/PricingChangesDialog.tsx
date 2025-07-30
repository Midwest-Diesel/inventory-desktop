import Error from "@/components/Error";
import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { getSupabaseFile, uploadSupabaseFile } from "@/scripts/config/supabase";
import { FormEvent, useState } from "react";
import * as XLSX from "xlsx";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  openTable: () => void
  setTableData: (data: PricingChangesReport[]) => void
  setReportsOpen: (open: boolean) => void
}


export default function PricingChangesDialog({ open, setOpen, openTable, setTableData, setReportsOpen }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [list, setList] = useState<PricingChangesReport[]>([]);
  const [error, setError] = useState('');

  const showPreviousResults = async () => {
    openTable();
    setReportsOpen(false);
    setOpen(false);
    const url = await getSupabaseFile('files', 'prev_pricing_changes.json');
    const prevResults = await readJson(url);
    setTableData(prevResults);
  };

  const handleResults = async (e: FormEvent) => {
    e.preventDefault();
    openTable();
    setReportsOpen(false);
    setOpen(false);

    const url = await getSupabaseFile('files', 'pricing_changes.xlsx');
    const oldList = await readFile(url);
    await uploadSupabaseFile('files', file, 'pricing_changes.xlsx', { upsert: true });
    const filteredList = getModifiedRows(oldList);
    await uploadSupabaseFile('files', new File([JSON.stringify(filteredList)], { type: 'application/json' } as any), 'prev_pricing_changes.json', { upsert: true });
    setTableData(filteredList);
  };

  const getModifiedRows = (oldList: PricingChangesReport[]) => {
    const deletedRows = oldList.filter((r) => !list.some((row) => row.partNum === r.partNum));
    const addedRows = list.filter((row) => !oldList.some((r) => r.partNum === row.partNum));
    let newList = list.map((row) => {
      const oldRow = oldList.find((r) => r.partNum === row.partNum);
      const normalizeSalesModel = (val?: string) => (
        (val ?? '')
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
          .sort()
          .join(';')
      );

      const currentSalesModel = normalizeSalesModel(row.salesModel);
      const previousSalesModel = normalizeSalesModel(oldRow?.salesModel);
      const isSame = (
        !!oldRow &&
        row.desc === oldRow.desc &&
        Number(row.qty) === Number(oldRow.qty) &&
        currentSalesModel === previousSalesModel &&
        row.classCode === oldRow.classCode &&
        Number(row.price) === Number(oldRow.price) &&
        Number(row.percent) === Number(oldRow.percent)
      );

      if (!oldRow || isSame) {
        return {
          ...row,
          salesModel: currentSalesModel
        };
      }

      return {
        ...row,
        salesModel: currentSalesModel,
        oldPartNum: oldRow.partNum,
        oldDesc: oldRow.desc,
        oldQty: Number(oldRow.qty),
        oldSalesModel: previousSalesModel,
        oldClassCode: oldRow.classCode,
        oldPrice: Number(oldRow.price),
        oldPercent: Number(oldRow.percent)
      };
    }).filter((r) => r.partNum && r.partNum !== 'undefined');

    // Filter out ADDED rows from existing list
    newList = newList.filter((row) => (
      !addedRows.some((addedRow) => row.partNum === addedRow.partNum)
    ));
    
    return [
      ...deletedRows.map((row) => {
        return {
          ...row,
          oldPartNum: 'DELETE',
          oldDesc: 'DELETE',
          oldQty: 'DELETE' as any,
          oldSalesModel: 'DELETE',
          oldClassCode: 'DELETE',
          oldPrice: 'DELETE' as any,
          oldPercent: 'DELETE' as any
        };
      }),
      ...addedRows.map((row) => {
        return {
          ...row,
          oldPartNum: 'ADD',
          oldDesc: 'ADD',
          oldQty: 'ADD' as any,
          oldSalesModel: 'ADD',
          oldClassCode: 'ADD',
          oldPrice: 'ADD' as any,
          oldPercent: 'ADD' as any
        };
      }),
      ...newList
    ];
  };

  const readFile = async (url: string): Promise<PricingChangesReport[]> => {
    const res = await fetch(url);
    const blob = await res.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet).map((row: any) => {
            return {
              partNum: `${row.PART_NUMBER}`.trim(),
              desc: row.PART_DESCRIPTION,
              qty: Number(row.AVAILABLE_QTY),
              salesModel: row.SALES_MODEL?.toString().replaceAll('*', ';') ?? '',
              classCode: row.MAJOR_CLASS_CODE,
              price: Number(row.DISC_PRICE),
              percent: Number(row.DISC_PERCENT)
            };
          }).filter((row) => row.partNum && row.partNum !== 'undefined');
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(blob);
    });
  };

  const readJson = async (url: string): Promise<PricingChangesReport[]> => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      return json;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const formatFile = (jsonData: string[][]): PricingChangesReport[] => {
    // Parse object structure
    const partNumIdx = jsonData[0].indexOf('PART_NUMBER');
    const descIdx = jsonData[0].indexOf('PART_DESCRIPTION');
    const qtyIdx = jsonData[0].indexOf('AVAILABLE_QTY');
    const salesModelIdx = jsonData[0].indexOf('SALES_MODEL');
    const classCodeIdx = jsonData[0].indexOf('MAJOR_CLASS_CODE');
    const priceIdx = jsonData[0].indexOf('DISC_PRICE');
    const percentIdx = jsonData[0].indexOf('DISC_PERCENT');
    const err: string[] = [];
    setError('');
    if (partNumIdx < 0) err.push('PART_NUMBER');
    if (descIdx < 0) err.push('PART_DESCRIPTION');
    if (qtyIdx < 0) err.push('AVAILABLE_QTY');
    if (salesModelIdx < 0) err.push('SALES_MODEL');
    if (classCodeIdx < 0) err.push('MAJOR_CLASS_CODE');
    if (priceIdx < 0) err.push('DISC_PRICE');
    if (percentIdx < 0) err.push('DISC_PERCENT');
    if (err.length > 0) setError(`Missing or mispelled columns: ${err.join(', ')}`);

    // Return formatted data
    const formattedData: PricingChangesReport[] = [];
    for (const row of jsonData.slice(1)) {
      const formattedRow = {
        partNum: `${row[partNumIdx]}`.trim(),
        desc: row[descIdx],
        qty: Number(row[qtyIdx]),
        salesModel: row[salesModelIdx]?.toString().replaceAll('*', ';') ?? '',
        classCode: row[classCodeIdx],
        price: Number(row[priceIdx]),
        percent: Number(row[percentIdx])
      };
      if (row[partNumIdx]) formattedData.push(formattedRow);
    }
    return formattedData;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files ?? [])[0];
    setFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setList(formatFile(jsonData).filter((row) => row.partNum));
    };
    reader.readAsArrayBuffer(file);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Pricing Changes"
      width={400}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleResults}>
        <Error msg={error} darkBg={true} />
        <Input
          label="Upload Spreadsheet"
          variant={['label-bold']}
          onChange={(e: any) => handleFile(e)}
          accept=".xlsx,.xls"
          type="file"
        />

        <br />
        <div className="form__footer">
          <Button type="button" onClick={showPreviousResults}>Show Previous Results</Button>
          <Button type="submit">Get Results</Button>
        </div>
      </form>
    </Dialog>
  );
}
