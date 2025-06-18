
import Barcode from "../Library/Barcode";

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
        <p className="part-tag__remarks">{ remarks }</p>
        <div className="part-tag__barcode">
          <Barcode value={stockNum ?? ''} />
        </div>
      </div>

      <div className="part-tag__bottom-row">
        <p className="part-tag__date">{ date }</p>
        <h1>{ partNum }</h1>
        <p className="part-tag__rating">{ rating }</p>
      </div>
    </div>
  );
}
