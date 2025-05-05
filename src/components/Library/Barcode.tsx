import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';


export default function Barcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value.toUpperCase(), {
        format: 'CODE39',
        displayValue: false,
        margin: 0,
        height: 180,
        width: 3
      });
    }
  }, [value]);

  return <svg ref={svgRef}></svg>;
}
