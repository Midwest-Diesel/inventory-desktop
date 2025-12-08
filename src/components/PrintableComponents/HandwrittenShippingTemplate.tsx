
import Table from "../library/Table";

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
    legacyId: string
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
          <table style={{ minWidth: '30rem' }}>
            <tbody>
              <tr><td colSpan={3}>{ data.billToCompany || <span className="print-placeholder">BILL TO COMPANY</span> }</td></tr>
              <tr><td colSpan={3}>{ data.billToAddress || <span className="print-placeholder">BILL TO ADDRESS</span> }</td></tr>
              <tr><td colSpan={3}>{ data.billToAddress2 || <span className="print-placeholder">BILL TO ADDRESS 2</span> }</td></tr>
              <tr>
                <td>{ data.billToCity || <span className="print-placeholder">BILL TO CITY</span> }</td>
                <td>{ data.billToState || <span className="print-placeholder">BILL TO STATE</span> }</td>
                <td>{ data.billToZip || <span className="print-placeholder">BILL TO ZIP</span> }</td>
                <td style={{ paddingLeft: '0.5rem' }} className="no-border">
                  <strong>TAXABLE</strong> <img src={data.taxable ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} />
                </td>
              </tr>
              <tr><td colSpan={3}>{ data.billToCountry || <span className="print-placeholder">BILL TO COUNTRY</span> }</td></tr>
            </tbody>
          </table>
          <table style={{ minWidth: '30rem' }}>
            <tbody>
              <tr><td colSpan={3}>{ data.shipToCompany || <span className="print-placeholder">SHIP TO COMPANY</span> }</td></tr>
              <tr><td colSpan={3}>{ data.shipToAddress || <span className="print-placeholder">SHIP TO ADDRESS</span> }</td></tr>
              <tr><td colSpan={3}>{ data.shipToAddress2 || <span className="print-placeholder">SHIP TO ADDRESS 2</span> }</td></tr>
              <tr>
                <td>{ data.shipToCity || <span className="print-placeholder">SHIP TO CITY</span> }</td>
                <td>{ data.shipToState || <span className="print-placeholder">SHIP TO STATE</span> }</td>
                <td>{ data.shipToZip || <span className="print-placeholder">SHIP TO ZIP</span> }</td>
              </tr>
              <tr>
                <td>{ data.shipToContact || <span className="print-placeholder">SHIP TO CONTACT</span> }</td>
                <td colSpan={2}>{ data.shipToCountry || <span className="print-placeholder">SHIP TO COUNTRY</span> }</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="handwritten-acct-template__column">
          <div className="handwritten-acct-template__column">
            <div className="handwritten-acct-template__row">
              <p><strong>Created By:</strong> { data.createdBy }</p>
              <p><strong>Sale Of:</strong> { data.soldBy }</p>
            </div>
            <p>{ data.legacyId && <><strong>Legacy ID:</strong> {data.legacyId}</> }</p>
            <p><strong>Handwritten ID:</strong> { data.handwrittenId }</p>
          </div>
          <table style={{ minWidth: '20rem' }}>
            <tbody>
              <tr><td colSpan={2}>{ data.date || <span className="print-placeholder">DATE</span> }</td></tr>
              <tr><td colSpan={2}>{ data.contact || <span className="print-placeholder">CONTACT NAME</span> }</td></tr>
              <tr><td colSpan={2}>{ data.poNum || <span className="print-placeholder">PO#</span> }</td></tr>
              <tr>
                <td>{ data.shipVia || <span className="print-placeholder">SHIP VIA</span> }</td>
                <td>{ data.paymentType || <span className="print-placeholder">PAYMENT TYPE</span> }</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="handwritten-acct-template__checkboxes">
        <strong>BLIND <img src={data.blind ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} /></strong>
        <strong>NPI <img src={data.npi ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} /></strong>
        <strong>SETUP <img src={data.setup ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} /></strong>
      </div>
      <div className="handwritten-acct-template__checkboxes">
        <strong>COLLECT <img src={data.collect ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} /></strong>
        <strong>3RD PARTY BILL <img src={data.thirdParty ? '/images/icons/cbx-filled.png' : '/images/icons/cbx-empty.png'} alt="" width={10} height={10} /></strong>
        <><strong>ACCOUNT #</strong> { data.accountNum }</>
      </div>

      <Table style={{ marginTop: '0.3rem' }} variant={['plain']}>
        <thead>
          <tr>
            <th>COST</th>
            <th>QTY</th>
            <th>PART NUMBER</th>
            <th>DESCRIPTION</th>
            <th>STOCK NUMBER</th>
            <th>LOCATION</th>
            <th>UNIT PRICE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.cost }</td>
                <td>{ item.qty }</td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                <td>{ item.stockNum }</td>
                <td>{ item.location }</td>
                <td>{ item.unitPrice }</td>
                <td>{ item.total }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="handwritten-acct-template__bottom-section">
        <h4 className="handwritten-acct-template__total">{ data.handwrittenTotal }</h4>
        <p>{ data.invoiceNotes || <span className="print-placeholder">INVOICE NOTES</span> }</p>
        <p>{ data.shippingNotes || <span className="print-placeholder">SHIPPING NOTES</span> }</p>
        <h2 className="print-placeholder">SHIPPING COPY</h2>
      </div>
    </div>
  );
}
