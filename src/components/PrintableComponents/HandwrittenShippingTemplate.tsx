import Table from "../Library/Table"

interface Props {
  data: {
    billToCompany: string
    billToAddress: string
    billToAddress2: string
    billToCity: string
    billToState: string
    billToZip: string
    billToCountry: string
    shipToCompany: string
    shipToAddress: string
    shipToAddress2: string
    shipToCity: string
    shipToState: string
    shipToZip: string
    shipToContact: string
    shipToCountry: string
    accountNum: string
    paymentType: string
    createdBy: string
    soldBy: string
    handwrittenId: string
    date: string
    contact: string
    poNum: string
    shipVia: string
    source: string
    invoiceNotes: string
    shippingNotes: string
    mp: string
    cap: string
    br: string
    fl: string
    setup: string
    taxable: string
    blind: string
    npi: string
    collect: string
    thirdParty: string
    handwrittenTotal: string
    items: {
      stockNum: string
      location: string
      cost: string
      qty: string
      partNum: string
      desc: string
      unitPrice: string
      total: string
      itemChildren: string
    }[]
  }
}


export default function HandwrittenShippingTemplate({ data }: Props) {
  return (
    <div className="handwritten-acct-template">
      <div className="handwritten-acct-template__top-section">
        <div className="handwritten-acct-template__column">
          <p>{ data.billToCompany }</p>
        </div>
        <div className="handwritten-acct-template__column">

        </div>
      </div>

      <div className="handwritten-acct-template__checkboxes">

      </div>

      <Table variant={['plain']}>
        <thead>
          
        </thead>
        <tbody>

        </tbody>
      </Table>

      <h4 className="handwritten-acct-template__total"></h4>
      <div className="handwritten-acct-template__bottom">

        <h2>SHIPPING COPY</h2>
      </div>
    </div>
  );
}
