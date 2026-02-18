import { useNavState } from "@/hooks/useNavState";
import CreditCardLabelTemplate from "@/components/printableComponents/CreditCardLabelTemplate";
import HandwrittenAccountingTemplate from "@/components/printableComponents/HandwrittenAccountingTemplate";
import HandwrittenCoreTemplate from "@/components/printableComponents/HandwrittenCoreTemplate";
import HandwrittenShippingTemplate from "@/components/printableComponents/HandwrittenShippingTemplate";
import PackingSlipTemplate from "@/components/printableComponents/PackingSlipTemplate";
import PartTag from "@/components/printableComponents/PartTag";
import PurchaseOrderTemplate from "@/components/printableComponents/PurchaseOrderTemplate";
import ReturnTemplate from "@/components/printableComponents/ReturnTemplate";
import ShippingLabelTemplate from "@/components/printableComponents/ShippingLabelTemplate";
import { usePrintQue } from "@/hooks/usePrintQue";
import WarrantyTemplate from "@/components/printableComponents/WarrantyTemplate";
import { invoke } from "@/scripts/config/tauri";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import PartTagUP from "@/components/printableComponents/PartTagUP";
import EngineTag from "@/components/printableComponents/EngineTag";
import EngineChecklist from "@/components/printableComponents/EngineChecklist";
import InjPartTag from "@/components/printableComponents/InjPartTag";
import QuoteListTemplate from "@/components/printableComponents/QuoteList";


export default function Print() {
  const printRef = useRef<HTMLDivElement>(null);
  const { que, clearQue } = usePrintQue();
  const { removeLastFromHistory, tabs, push } = useNavState();
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
    for (const item of que) {
      setActiveSheet(item.name);
      setData(item.data);
      setMaxWidth(item.maxWidth);
      setMaxHeight(item.maxHeight);
      await waitForDomPaint();
      if (!printRef.current) continue;
      const imageData = await toPng(printRef.current);
      invoke(item.printCmd, { imageData });
    }

    setActiveSheet('');
    setData(null);
    clearQue();
    await removeLastFromHistory();
  };


  return (
    <div ref={printRef} style={{ height: '100vh', backgroundColor: 'white', color: 'black', maxWidth, maxHeight }}>
      { activeSheet === 'partTag' && <PartTag data={data} /> }
      { activeSheet === 'injPartTag' && <InjPartTag data={data} /> }
      { activeSheet === 'partTagUP' && <PartTagUP data={data} /> }
      { activeSheet === 'engineTag' && <EngineTag data={data} /> }
      { activeSheet === 'engineChecklist' && <EngineChecklist /> }
      { activeSheet === 'handwrittenAcct' && <HandwrittenAccountingTemplate data={data} /> }
      { activeSheet === 'handwrittenShip' && <HandwrittenShippingTemplate data={data} /> }
      { activeSheet === 'handwrittenCore' && <HandwrittenCoreTemplate data={data} /> }
      { activeSheet === 'shippingLabel' && <ShippingLabelTemplate data={data} /> }
      { activeSheet === 'ccLabel' && <CreditCardLabelTemplate data={data} /> }
      { activeSheet === 'warranty' && <WarrantyTemplate data={data} /> }
      { activeSheet === 'return' && <ReturnTemplate data={data} /> }
      { activeSheet === 'packingSlip' && <PackingSlipTemplate data={data} /> }
      { activeSheet === 'po' && <PurchaseOrderTemplate data={data} /> }
      { activeSheet === 'quotesList' && <QuoteListTemplate data={data} /> }
    </div>
  );
}