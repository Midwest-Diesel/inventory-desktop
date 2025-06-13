import Image from "next/image";
import Table from "../Library/Table";

interface Props {
  data: {
    vendor: string
    createdDate: string
    id: string
    vendorWarrantyId: string
    completed: string
    billToAddress: string
    shipToAddress: string
    paymentTerms: string
    restockFee: string
    claimReason: string[]
    vendorReport: string[]
    items: {
      qty: string
      partNum: string
      desc: string
      stockNum: string
      cost: string
      price: string
      hasVendorReplacedPart: boolean
      isCustomerCredited: boolean
      vendorCredit: string
    }[]
  }
}


export default function WarrantyTemplate({ data }: Props) {
  return (
    <div className="warranty-template">
      <header>
        <Image src="/images/midwest-diesel.jpg" alt="" width={50} height={70} />
        <h1>Warranty Claim</h1>
      </header>
      
      <div className="warranty-template__top-section">
        <div className="warranty-template__column">
          <p><strong>Vendor:</strong> { data.vendor }</p>
          <p><strong>Date:</strong> { data.createdDate }</p>
          <p><strong>Warranty #:</strong> { data.id }</p>
          <p><strong>Vendor Warranty #:</strong> { data.vendorWarrantyId }</p>
        </div>
        <div className="warranty-template__column">
          <p><strong>Bill To:</strong> { data.billToAddress }</p>
          <p><strong>Ship To:</strong> { data.shipToAddress }</p>
        </div>
      </div>

      <Table style={{ marginTop: '0.3rem' }} variant={['plain']}>
        <thead>
          <tr>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Stock Number</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Vendor Replaced</th>
            <th>Customer Credited</th>
            <th>Vendor Credit</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.qty }</td>
                <td>{ item.partNum }</td>
                <td>{ item.desc }</td>
                <td>{ item.stockNum }</td>
                <td>{ item.cost }</td>
                <td>{ item.price }</td>
                <td style={{ textAlign: 'center' }}>{ item.hasVendorReplacedPart && 'X' }</td>
                <td style={{ textAlign: 'center' }}>{ item.isCustomerCredited && 'X' }</td>
                <td>{ item.vendorCredit }</td>
             ; </tr>
            );
          })}
        </tbody>
      </Table>
      
      <div className="warranty-template__bottom-section">
        <div className="warranty-template__column">
          <div className="warranty-template__box-thin">
            <h4>Reason for Warranty Claim</h4>
            <p style={{ minHeight: '10rem' }}>
              {data.claimReason.map((text, i) => {
                return <div key={i}>{ text }</div>;
              })}
            </p>
          </div>
          <div className="warranty-template__box-thin">
            <h4>Return Payment Terms</h4>
            <p>{ data.paymentTerms }</p>
          </div>
          <div className="warranty-template__box-thin">
            <h4>Restock Fee</h4>
            <p>{ data.restockFee }</p>
          </div>
        </div>
        <div className="warranty-template__box-thick">
          <h4>Report From Vendor</h4>
          <p>
            {data.vendorReport.map((text, i) => {
              return <div key={i}>{ text }</div>;
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
