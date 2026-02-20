import Button from "../../library/Button";
import { useEffect, useState } from "react";
import PricingChangesTable from "./PricingChangesTable";
import { addWatchedPricingRow, deleteWatchedPricingRow, getWatchedPricingRows } from "@/scripts/services/pricingChangesService";
import { downloadFile, fileStoragePath } from "@/scripts/services/fileService";

interface Props {
  closeTable: () => void
  data: PricingChangesReport[]
}


export default function PricingChanges({ closeTable, data }: Props) {
  const [list, setList] = useState<PricingChangesReport[]>([]);
  const [watchedPartNums, setWatchedPartNums] = useState<string[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const res = await getWatchedPricingRows();
      setWatchedPartNums(res);
    };
    fetchData();
  }, [data]);

  const handleGoBack = () => {
    closeTable();
  };

  const handleDownload = async () => {
    await downloadFile(`${fileStoragePath}/pricing_changes.xlsx`);
  };

  const toggleWatchRow = async (row: PricingChangesReport, isWatched: boolean) => {
    if (isWatched) {
      await deleteWatchedPricingRow(row.partNum);
      setWatchedPartNums(watchedPartNums.filter((r) => r !== row.partNum));
    } else {
      await addWatchedPricingRow(row.partNum);
      setWatchedPartNums((prev) => [...prev, row.partNum]);
    }
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-bar">
        <Button onClick={handleGoBack}>Back</Button>
        <Button onClick={handleDownload}>Download Spreadsheet</Button>
      </div>

      <PricingChangesTable
        data={data}
        list={list}
        setList={setList}
        watchedPartNums={watchedPartNums}
        toggleWatchRow={toggleWatchRow}
        limit={200}
        maxHeight="77vh"
      />
    </div>
  );
}
