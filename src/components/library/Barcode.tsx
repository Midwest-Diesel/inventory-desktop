import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface Props {
  value: string
  width?: number
  height?: number
}


export default function Barcode({ value, width = 3, height = 180 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value.toUpperCase(), {
        format: 'CODE39',
        displayValue: false,
        margin: 0,
        height,
        width
      });
    }
  }, [value]);

  return <svg ref={svgRef}></svg>;
}
