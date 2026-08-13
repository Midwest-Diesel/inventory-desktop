interface Props {
  data: {
    cardNum: string
    expDate: string
    cvv: string
    cardZip: string
    cardName: string
    cardAddress: string
  }
}


export default function CreditCardLabelTemplate({ data }: Props) {
  return (
    <div className="cc-label-template">
      <p>{ data.cardNum }</p>
      <div className="cc-label-template__row">
        <p>{ data.expDate }</p>
        <p>{ data.cvv }</p>
        <p>{ data.cardZip }</p>
      </div>
      <p>{ data.cardName }</p>
      <p>{ data.cardAddress }</p>
    </div>
  );
}
