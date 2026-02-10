interface Props {
  data: {
    shipFromCompany: string,
    shipFromAddress: string,
    shipFromAddress2: string,
    shipFromCityStateZip: string,
    shipToCompany: string,
    shipToAddress: string,
    shipToAddress2: string,
    shipToCityStateZip: string,
    shipToContact: string
  }
}


export default function ShippingLabelTemplate({ data }: Props) {
  return (
    <div className="shipping-label-template">
      <div className="shipping-label-template__ship-from">
        <p>{ data.shipFromCompany }</p>
        <p>{ data.shipFromAddress }</p>
        <p>{ data.shipFromAddress2 }</p>
        <p>{ data.shipFromCityStateZip }</p>
      </div>

      <div className="shipping-label-template__ship-to">
        <p>SHIP TO:</p>
        <p>{ data.shipToCompany }</p>
        <p>{ data.shipToAddress }</p>
        <p>{ data.shipToAddress2 }</p>
        <p>{ data.shipToCityStateZip }</p>
        { data.shipToContact && <p>ATTN: { data.shipToContact }</p> }
      </div>
    </div>
  );
}
