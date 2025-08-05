import Barcode from "../Library/Barcode";

interface Props {
  data: {
    stockNum: string
    location: string
    date: string
    partNum: string
  }
}


export default function PartTagUP({ data }: Props) {
  const { stockNum, location, date, partNum } = data;

  return (
    <div className="part-tag-up">
      <p className="part-tag-up__date">{ date }</p>

      <div className="part-tag-up__middle">
        <h1>{ stockNum }</h1>
        <h1>{ partNum }</h1>
      </div>

      <p className="part-tag-up__location">{ location.replaceAll(' ', '_') }</p>

      <div className="part-tag-up__barcode">
        <Barcode value={stockNum ?? ''} />
      </div>
    </div>
  );
}
