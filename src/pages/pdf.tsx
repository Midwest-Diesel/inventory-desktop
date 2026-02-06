import PurchaseOrderTemplate from "@/components/printableComponents/PurchaseOrderTemplate";
import { useNavState } from "@/hooks/useNavState";
import { usePdfQue } from "@/hooks/usePdfQue";
import { invoke } from "@/scripts/config/tauri";
import { generatePDF } from "@/scripts/tools/utils";
import { useEffect, useRef, useState } from "react";


export default function Print() {
  const ref = useRef<HTMLDivElement>(null);
  const { que, clearQue } = usePdfQue();
  const { removeLastFromHistory, tabs, push } = useNavState();
  const [activeSheet, setActiveSheet] = useState('');
  const [data, setData] = useState<any>(null);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');

  useEffect(() => {
    if (tabs.length === 0) push('Home', '/');
    handleExport();
  }, []);

  const waitForDomPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const handleExport = async () => {
    for (const item of que) {
      setActiveSheet(item.name);
      setData(item.data);
      setMaxWidth(item.maxWidth);
      setMaxHeight(item.maxHeight);
      await waitForDomPaint();
      if (!ref.current) continue;
      const pdf = await generatePDF([ref.current], 'PurchaseOrder', 'C:/MWD/scripts/attachments');
      invoke(item.pdfCmd, { pdf });
    }

    setActiveSheet('');
    setData(null);
    clearQue();
    await removeLastFromHistory();
  };


  return (
    <div ref={ref} style={{ height: '100vh', backgroundColor: 'white', color: 'black', maxWidth, maxHeight }}>
      { activeSheet === 'po' && <PurchaseOrderTemplate data={data} /> }
    </div>
  );
}
