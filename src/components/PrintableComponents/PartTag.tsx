import Image from "next/image";

interface Props {
  properties: {
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


export default function PartTag({ properties }: Props) {
  const { stockNum, model, serialNum, hp, location, remarks, date, partNum, rating, hasPictures } = properties;
  return (
    <div className="part-tag">
      <div className="part-tag__header">
        { !hasPictures && <Image src="/images/icons/image-black.svg" alt="P" width={40} height={40} /> }
        <h1>{ stockNum }</h1>
      </div>
      <div className="part-tag__row">
        <p>{ model }23</p>
        <p>{ serialNum }123</p>
        <p>{ hp }132</p>
      </div>

      <div className="part-tag__middle">
        <p className="part-tag__location">{ location }</p>
        <p className="part-tag__remarks">{ remarks }</p>
        <p className="part-tag__barcode">*{ stockNum }*</p>
      </div>

      <div className="part-tag__bottom-row">
        <p className="part-tag__date">{ date }</p>
        <h1>{ partNum }</h1>
        <p className="part-tag__rating">{ rating }</p>
      </div>
    </div>
  );
}
