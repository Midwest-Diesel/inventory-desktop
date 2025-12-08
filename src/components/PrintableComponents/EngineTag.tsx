import Barcode from "../library/Barcode";

interface Props {
  data: {
    date: string
    location: string
    serialNum: string
    model: string
    arrNum: string
    horsePower: string
    comments: string
    purchasedFrom: string
    currentStatus: string
    stockNum: string
  }
}


export default function EngineTag({ data }: Props) {
  const { date, location, serialNum, model, arrNum, horsePower, comments, purchasedFrom, currentStatus, stockNum } = data;

  return (
    <div className="engine-tag">
      <div className="engine-tag__row">
        <div className="engine-tag__row--header">
          <p>Inventory Date</p>
          <p>Location</p>
        </div>
        <div className="engine-tag__row--content">
          <p>{ date }</p>
          <p>{ location }</p>
        </div>
      </div>

      <div className="engine-tag__row">
        <div className="engine-tag__row--header">
          <p>Serial Number</p>
          <p>Engine Type</p>
        </div>
        <div className="engine-tag__row--content">
          <p>{ serialNum }</p>
          <p>{ model }</p>
        </div>
      </div>

      <div className="engine-tag__row">
        <div className="engine-tag__row--header">
          <p>Arrangement Number</p>
          <p>Horsepower</p>
        </div>
        <div className="engine-tag__row--content">
          <p>{ arrNum }</p>
          <p>{ horsePower }</p>
        </div>
      </div>

      <div className="engine-tag__row">
        <div className="engine-tag__row--header">
          <p>Notes</p>
        </div>
        <div className="engine-tag__row--content">
          <p>{ comments }</p>
        </div>
      </div>


      <div className="engine-tag__bottom">
        <div className="engine-tag__row">
          <div className="engine-tag__row--header">
            <p>Received From</p>
            <p>Condition</p>
          </div>
          <div className="engine-tag__row--content">
            <p>{ purchasedFrom }</p>
            <p>{ currentStatus }</p>
          </div>
        </div>

        <div className="engine-tag__barcode">
          <Barcode value={stockNum ?? ''} height={68} />
        </div>

        <h2 className="engine-tag__stock-num">{ stockNum }</h2>
      </div>
    </div>
  );
}
