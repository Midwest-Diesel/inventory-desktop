import { useEffect, useState } from "react";
import Checkbox from "../library/Checkbox";
import { getRowClasses } from "@/scripts/logic/shippingList";
import { formatShippingListWeightDims, formatWeightDims } from "@/scripts/tools/stringUtils";

interface Props {
  row: ShippingListRow
}


export default function ShippingListRow({ row }: Props) {
  const [className, setClassName] = useState('shipping-list-row');

  useEffect(() => {
    setClassName(getRowClasses(row));
  }, [row]);


  return (
    <tr className={className}>
      <td>{ row.createdBy }</td>
      <td className={row.shipVia === 'UPS Red' ? 'shipping-list-row--ups-red' : ''}>
        { row.shipVia }
      </td>
      <td>{ row.customer }</td>
      <td>{ row.shipToContact }</td>
      <td>{ row.partNum }</td>
      <td>{ row.desc }</td>
      <td>{ row.stockNum }</td>
      <td>{ row.location }</td>
      <td>{ row.mp || '' }</td>
      <td>{ row.br || '' }</td>
      <td>{ row.cap || '' }</td>
      <td>{ row.fl || '' }</td>
      <td>{ row.marketingContact }</td>
      <td style={{ textAlign: 'center' }}>
        <Checkbox checked={row.pulled} onChange={() => {}} />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Checkbox checked={row.packaged} onChange={() => {}} />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Checkbox checked={row.gone} onChange={() => {}} />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Checkbox checked={row.ready} onChange={() => {}} />
      </td>
      <td>{ formatShippingListWeightDims(row.weightDims) }</td>
      <td>{ row.handwrittenId }</td>
      <td>{ row.scheduled }</td>
    </tr>
  );
}
