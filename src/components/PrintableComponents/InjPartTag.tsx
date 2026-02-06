import Barcode from "../library/Barcode";

interface Props {
  data: {
    stockNum: string
    partNum: string
  }
}


export default function InjPartTag({ data }: Props) {
  const { stockNum, partNum } = data;
  
  return (
    <div className="tiny-part-tag">
      <div className="tiny-part-tag__barcode">
        <Barcode value={stockNum ?? ''} height={30} width={0.7} />
      </div>

      <h2>{ stockNum }</h2>
      <h2>{ partNum }</h2>
    </div>
  );
}
