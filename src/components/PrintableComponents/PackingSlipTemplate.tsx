import Table from "../Library/Table";

interface Props {
  data: {
    invoiceDate: string
    poNum: string
    billToCompany: string
    billToAddress: string
    billToAddress2: string
    billToCityStateZip: string
    shipToCompany: string
    shipToContact: string
    shipToAddress: string
    shipToAddress2: string
    shipToCityStateZip: string
    blind: boolean
    items: {
      qty: string
      partNum: string
      desc: string
      price: string
      total: string
    }[]
  }
}


export default function PackingSlipTemplate({ data }: Props) {
  return (
    <div className="packing-slip-template">
      <header>
        {!data.blind &&
          <>
            <img src="/images/midwest-diesel.jpg" alt="" />
            <div className="packing-slip-template__phone">
              <p><strong>Phone:</strong> (888) 866-3406</p>
              <p><strong>Fax:</strong> (763) 450-2197</p>
            </div>
          </>
        }
        <h1>PACKING SLIP</h1>
        <div className="packing-slip-template__header-row">
          <p><strong>Invoice Date:</strong> { data.invoiceDate }</p>
          { data.poNum && !data.blind && <p><strong>PO Number:</strong> { data.poNum }</p> }
        </div>
      </header>

      { !data.blind && <p><strong>Sold To:</strong></p> }
      <p>{ data.billToCompany }</p>
      <p>{ data.billToAddress }</p>
      <p>{ data.billToAddress2 }</p>
      <p>{ data.billToCityStateZip }</p>
      <br />

      <p><strong>Ship To:</strong></p>
      <p>{ data.shipToCompany }</p>
      <p>{ data.shipToAddress }</p>
      <p>{ data.shipToAddress2 }</p>
      <p>{ data.shipToCityStateZip }</p>

      <Table variant={['plain']}>
        <thead>
          <tr>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            { !data.blind && <th>Price</th> }
            { !data.blind && <th>Total</th> }
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.qty }</td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                { !data.blind && <td>{ item.price }</td> }
                { !data.blind && <td>{ item.total }</td> }
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  );
}
