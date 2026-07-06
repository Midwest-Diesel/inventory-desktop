import { useEffect, useRef } from "react";
import Barcode from "../library/Barcode";

interface Props {
  data: {
    stockNum: string
    model: string
    serialNum: string
    hp: string
    location: string
    remarks: string
    date: string
    partNum: string
    rating: number
    hasPictures: boolean
  }
}


export default function PartTag({ data }: Props) {
  const { stockNum, model, serialNum, hp, location, remarks, date, partNum, rating, hasPictures } = data;
  const remarksRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = remarksRef.current;
    if (!el) return;

    let fontSize = 50;
    el.style.fontSize = `${fontSize}px`;

    while (el.scrollHeight > el.clientHeight && fontSize > 12) {
      fontSize -= 1;
      el.style.fontSize = `${fontSize}px`;
    }
  }, [remarks]);

  
  return (
    <div className="part-tag">
      <div className="part-tag__header">
        { !hasPictures && <img src="/images/icons/image-black.svg" alt="P" width={120} height={120} /> }
        <h1>{ stockNum }</h1>
      </div>
      <div className="part-tag__row">
        <p>{ model }</p>
        <p>{ serialNum }</p>
        <p>{ hp }</p>
      </div>

      <div className="part-tag__middle">
        <p className="part-tag__location">{ location.replaceAll(' ', '_') }</p>
        <p ref={remarksRef} className="part-tag__remarks">{ remarks }</p>
      </div>
      
      <div className="part-tag__barcode">
        <Barcode value={stockNum ?? ''} />
      </div>

      <div className="part-tag__bottom-row">
        <p className="part-tag__date">{ date }</p>
        <h1 style={{ fontSize: '120px' }}>{ partNum }</h1>
        <p className="part-tag__rating">{ rating }</p>
      </div>
    </div>
  );
}
