import { useNavState } from "@/components/Navbar/useNavState";
import CreditCardLabelTemplate from "@/components/PrintableComponents/CreditCardLabelTemplate";
import HandwrittenAccountingTemplate from "@/components/PrintableComponents/HandwrittenAccountingTemplate";
import HandwrittenCoreTemplate from "@/components/PrintableComponents/HandwrittenCoreTemplate";
import HandwrittenShippingTemplate from "@/components/PrintableComponents/HandwrittenShippingTemplate";
import PackingSlipTemplate from "@/components/PrintableComponents/PackingSlipTemplate";
import PurchaseOrderTemplate from "@/components/PrintableComponents/PurchaseOrderTemplate";
import ReturnTemplate from "@/components/PrintableComponents/ReturnTemplate";
import ShippingLabelTemplate from "@/components/PrintableComponents/ShippingLabelTemplate";
import { usePrintQue } from "@/components/PrintableComponents/usePrintQue";
import WarrantyTemplate from "@/components/PrintableComponents/WarrantyTemplate";
import { invoke } from "@/scripts/config/tauri";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";


export default function Print() {
  const printRef = useRef<HTMLDivElement>(null);
  const { que, clearQue } = usePrintQue();
  const { backward, tabs, push } = useNavState();
  const [activeSheet, setActiveSheet] = useState('');
  const [data, setData] = useState<any>(null);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');

  useEffect(() => {
    if (tabs.length === 0) push('Home', '/');
    handlePrint();
  }, []);

  const waitForDomPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const handlePrint = async () => {
    for (let item of que) {
      setActiveSheet(item.name);
      setData(item.data);
      setMaxWidth(item.maxWidth);
      setMaxHeight(item.maxHeight);
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
    <div ref={printRef} style={{ height: '100vh', backgroundColor: 'white', color: 'black', maxWidth, maxHeight }}>
      { activeSheet === 'handwrittenAcct' && <HandwrittenAccountingTemplate data={data} /> }
      { activeSheet === 'handwrittenShip' && <HandwrittenShippingTemplate data={data} /> }
      { activeSheet === 'handwrittenCore' && <HandwrittenCoreTemplate data={data} /> }
      { activeSheet === 'shippingLabel' && <ShippingLabelTemplate data={data} /> }
      { activeSheet === 'ccLabel' && <CreditCardLabelTemplate data={data} /> }
      { activeSheet === 'warranty' && <WarrantyTemplate data={data} /> }
      { activeSheet === 'return' && <ReturnTemplate data={data} /> }
      { activeSheet === 'packingSlip' && <PackingSlipTemplate data={data} /> }
      { activeSheet === 'po' && <PurchaseOrderTemplate data={data} /> }
    </div>
  );
}