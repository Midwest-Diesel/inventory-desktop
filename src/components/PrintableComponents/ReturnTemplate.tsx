import Table from "../Library/Table"

interface Props {
  data: {
    createdBy: string
    date: string
    poNum: string
    id: string
    invoiceDate: string
    billToCompany: string
    shipToCompany: string
    billToAddress: string
    billToCity: string
    billToState: string
    billToZip: string
    billToPhone: string
    dateCalled: string
    salesman: string
    returnReason: string
    returnNotes: string
    returnPaymentTerms: string
    payment: string
    restockFee: string
    items: {
      cost: string
      stockNum: string
      qty: string
      partNum: string
      desc: string
      unitPrice: string
      total: string
    }[]
  }
}


export default function ReturnTemplate({ data }: Props) {
  return (
    <div className="return-template">
      <header>
        <h1>Return { data.id }</h1>
        <div className="return-template__row">
          <h2>Created By: { data.createdBy }</h2>
          <h2>{ data.date }</h2>
        </div>
      </header>

      <div className="return-template__middle-section">
        <div className="return-template__column">
          <p><strong>PO #</strong> { data.poNum }</p>
          <p><strong>Inv. Date</strong> { data.invoiceDate }</p>
          <p><strong>Sold To</strong> { data.billToCompany }</p>
          <p><strong>Ship To</strong> { data.shipToCompany }</p>
          <p><strong>Address</strong> { data.billToAddress }</p>
          <p><strong>City</strong> { data.billToCity }</p>
          <p><strong>State</strong> { data.billToState }</p>
          <p><strong>Zip</strong> { data.billToZip }</p>
          <p><strong>Phone</strong> { data.billToPhone }</p>
        </div>
        <div className="return-template__column">
          <p><strong>Date Called</strong> { data.dateCalled }</p>
          <p><strong>Returned By</strong> { data.salesman }</p>
          <br />
          <p><strong>Approved By</strong> ____________</p>
          <p><strong>Date</strong>        ____________</p>
          <br />
          <p><strong>Received By</strong> ____________</p>
          <p><strong>Date</strong>        ____________</p>
          <br />
        </div>        
      </div>

      <div className="return-template__middle-section">
        <div className="return-template__column">
          <div>
            <p><strong>Return Reason</strong></p>
            <p>{ data.returnReason }</p>
          </div>
          <br />
          <br />
          <br />
          <div>
            <p><strong>Return Notes</strong></p>
            <p>{ data.returnNotes }</p>
          </div>
        </div>
        <div className="return-template__column">
          <p><strong>Condition</strong></p>
          <br />
          <br />
          <br />
          <div>
            <p><strong>Return Payment Terms</strong></p>
            <p>{ data.returnPaymentTerms }</p>
          </div>
        </div>
      </div>

      <p><strong>Payment Terms</strong> { data.payment }</p>
      <p><strong>Restocking Charge</strong> { data.restockFee }</p>
      <br />

      <Table style={{ marginTop: '0.3rem' }} variant={['plain']}>
        <thead>
          <tr>
            <th>Cost</th>
            <th>Stock Number</th>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.cost }</td>
                <td>{ item.stockNum }</td>
                <td>{ item.qty }</td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                <td>{ item.unitPrice }</td>
                <td>{ item.total }</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  );
}
