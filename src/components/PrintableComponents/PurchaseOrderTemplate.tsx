import Table from "../Library/Table"

interface Props {
  data: {
    id: string
    vendor: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    fax: string
    paymentTerms: string
    purchasedFor: string
    specialInstructions: string
    comments: string
    date: string
    orderedBy: string
    items: {
      qty: string
      desc: string
      price: string
      total: string
    }[]
  }
}


export default function PurchaseOrderTemplate({ data }: Props) {
  return (
    <div className="po-template">
      <header>
        <img src="/images/midwest-diesel.jpg" alt="" />
        <h1>Purchase Order { data.id }</h1>
      </header>
      
      <div className="po-template__section">
        <div className="po-template__column">
          <p><strong>From:</strong> { data.vendor }</p>
          <p><strong>Address:</strong> { data.address }</p>
          <p><strong>City:</strong> { data.city } <strong>State:</strong> { data.state } <strong>Zip:</strong> { data.zip }</p>
          <p><strong>Phone:</strong> { data.phone }</p>
          <p><strong>Fax:</strong> { data.fax }</p>
        </div>
        <div className="po-template__column">
          <p><strong>Ship To:</strong> Midwest Diesel</p>
          <p><strong>Address:</strong> 3051 82nd Lane NE</p>
          <p><strong>City:</strong> Blaine <strong>State:</strong> MN <strong>Zip:</strong> 55449</p>
          <p><strong>Phone:</strong> (763) 450-2075</p>
          <p><strong>Fax:</strong> (763) 450-2197</p>
        </div>
      </div>

      <div className="po-template__border"></div>

      <div className="po-template__section">
        <div className="po-template__column">
          <p><strong>Payment Terms:</strong> { data.paymentTerms }</p>
          <p><strong>Purchased For:</strong> { data.purchasedFor }</p>
          <p><strong>Special Instructions:</strong> { data.specialInstructions }</p>
          <p><strong>Comments:</strong> { data.comments }</p>
        </div>
        <div className="po-template__column">
          <p><strong>Date:</strong> { data.date } <strong>Ordered By:</strong> { data.orderedBy }</p>
        </div>
      </div>

      <Table variant={['plain']}>
        <thead>
          <tr>
            <th>Qty</th>
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
                <td>{ item.desc }</td>
                <td>{ item.price }</td>
                <td>{ item.total }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
