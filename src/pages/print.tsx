import { useNavState } from "@/components/Navbar/useNavState";
import HandwrittenAccountingTemplate from "@/components/PrintableComponents/HandwrittenAccountingTemplate";
import HandwrittenCoreTemplate from "@/components/PrintableComponents/HandwrittenCoreTemplate";
import HandwrittenShippingTemplate from "@/components/PrintableComponents/HandwrittenShippingTemplate";
import { usePrintQue } from "@/components/PrintableComponents/usePrintQue";
import { invoke } from "@/scripts/config/tauri";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";


export default function Print() {
  const printRef = useRef<HTMLDivElement>(null);
  const { que, clearQue } = usePrintQue();
  const { backward, tabs, push } = useNavState();
  const [activeSheet, setActiveSheet] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (tabs.length === 0) push('Home', '/');
    handlePrint();
  }, []);

  const waitForDomPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const handlePrint = async () => {
    for (let item of que) {
      setActiveSheet(item.name);
      setData(item.data);
      await waitForDomPaint();
      if (!printRef.current) continue;

      const imageData = await toPng(printRef.current);
      await invoke(item.printCmd, { imageData });
    }

    setActiveSheet('');
    setData(null);
    clearQue();
    backward();
  };


  return (
    <div ref={printRef} style={{ height: '100vh', backgroundColor: 'white', color: 'black', maxWidth: '1100px', maxHeight: '816px' }}>
      { activeSheet === 'handwrittenAcct' && <HandwrittenAccountingTemplate data={data} /> }
      { activeSheet === 'handwrittenShip' && <HandwrittenShippingTemplate data={data} /> }
      { activeSheet === 'handwrittenCore' && <HandwrittenCoreTemplate data={data} /> }
    </div>
  );
}