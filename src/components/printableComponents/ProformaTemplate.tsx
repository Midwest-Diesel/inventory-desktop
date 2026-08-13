import Table from "../library/Table";

interface Props {
  data: {
    date: string
    proformaId: string
    billToCompany: string
    billToAddress: string
    billToCity: string
    billToState: string
    billToZip: string
    shipToCompany: string
    shipToAddress: string
    shipToCity: string
    shipToState: string
    shipToZip: string
    poNum: string
    billToPhone: string
    orderTotal: string
    pageNum: number
    items: {
      qty: number
      partNum: string
      desc: string
      unitPrice: string
      total: string
    }[]
  }
}


export default function ProformaTemplate({ data }: Props) {
  return (
    <div className="proforma-template">
      <header className="proforma-template__header">
        <img src="/images/midwest-diesel.jpg" alt="" width={50} height={70} />
        <h6>Tel (763) 450-2075 Toll Free 1-888-866-3406 Fax (763) 450-2197</h6>

        <div className="proforma-template__split-row">
          <p>Invoice Date: { data.date }</p>
          <p>PRO FORMA <span style={{ marginLeft: '1rem' }}>{ data.proformaId }</span></p>
        </div>
      </header>
      <div className="proforma-template__divider"></div>
      
      {data.pageNum === 1 &&
        <>
          <div className="proforma-template__section">
            <div className="proforma-template__column">
              <p><strong>Sold To:</strong></p>
              <p>{ data.billToCompany }</p>
              <p>{ data.billToAddress }</p>
              <p>{ data.billToCity }, { data.billToState } { data.billToZip }</p>
            </div>

            <div className="proforma-template__column">
              <p><strong>Ship To:</strong></p>
              <p>{ data.shipToCompany }</p>
              <p>{ data.shipToAddress }</p>
              <p>{ data.shipToCity }, { data.shipToState } { data.shipToZip }</p>
            </div>
          </div>

          <br />
          <br />
          <div className="proforma-template__split-row">
            <p>Customer PO: { data.poNum }</p>
            <p>Phone: { data.billToPhone }</p>
          </div>

          <div className="proforma-template__divider"></div>
        </>
      }

      <Table variant={['plain']}>
        <thead>
          <tr>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.qty }</td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                <td>{ item.unitPrice }</td>
                <td>{ item.total }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <footer className="proforma-template__footer">
        <p>Page { data.pageNum }</p>
        <p><strong>ORDER TOTAL: { data.orderTotal }</strong></p>
      </footer>
    </div>
  );
}
