import { useEffect, useRef } from "react";

interface Props {
  html: string
  styles: any
  onPrint: () => void
}


export default function Print({ html, styles, onPrint }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current.innerHTML = html;

    window.addEventListener('afterprint', () => {
      onPrint();
    });
    window.print();
  }, [html]);


  return (
    <div className="print-screen">
      <div ref={ref} style={styles}></div>
    </div>
  );
}
