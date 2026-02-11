import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import GridItem from "../library/grid/GridItem";
import Select from "../library/select/Select";

interface Props {
  invoiceStatus: InvoiceStatus
  accountingStatus: AccountingStatus | null
  shippingStatus: ShippingStatus | null
  onChangeInvoiceStatus: (status: InvoiceStatus) => void
  onChangeAccountingStatus: (status: AccountingStatus | null) => void
  onChangeShippingStatus: (status: ShippingStatus | null) => void
  isEditing: boolean
}


export default function HandwrittenStatusFields({ invoiceStatus, accountingStatus, shippingStatus, onChangeInvoiceStatus, onChangeAccountingStatus, onChangeShippingStatus, isEditing }: Props) {
  const [user] = useAtom<User>(userAtom);


  return (
    <GridItem colSpan={12} variant={['low-opacity-bg']}>
      {user.subtype === 'frontDesk' || isEditing ?
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <Select
            label="Sales Status"
            variant={['label-stack']}
            value={invoiceStatus}
            onChange={(e) => onChangeInvoiceStatus(e.target.value as InvoiceStatus)}
            data-testid="sales-status"
          >
            <option value="INVOICE PENDING">INVOICE PENDING</option>
            <option value="SENT TO ACCOUNTING">SENT TO ACCOUNTING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="STOP - HOLD">STOP - HOLD</option>
            <option value="HOLD AS FAVOR">HOLD AS FAVOR</option>
          </Select>

          <Select
            label="Accouting Status"
            variant={['label-stack']}
            value={accountingStatus ?? ''}
            onChange={(e) => onChangeAccountingStatus(e.target.value as AccountingStatus)}
          >
            <option value=""></option>
            <option value="IN PROCESS">IN PROCESS</option>
            <option value="COMPLETE">COMPLETE</option>
            <option value="PAYMENT EXCEPTION">PAYMENT EXCEPTION</option>
          </Select>

          <Select
            label="Shipping Status"
            variant={['label-stack']}
            value={shippingStatus ?? ''}
            onChange={(e) => onChangeShippingStatus(e.target.value as ShippingStatus)}
          >
            <option value=""></option>
            <option value="ORDER PICKED">ORDER PICKED</option>
            <option value="ORDER PACKED">ORDER PACKED</option>
            <option value="ORDER COMPLETE">ORDER COMPLETE</option>
          </Select>
        </div>
      :
        <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <p style={{ fontSize: 'var(--font-md)' }}><strong>Sales Status</strong></p>
          <p style={{ color: 'var(--yellow-1)' }} data-testid="sales-status">{ invoiceStatus }</p>
        </div>
        <div>
          <p style={{ fontSize: 'var(--font-md)' }}><strong>Accounting Status</strong></p>
          <p style={{ color: 'var(--yellow-1)' }}>{ accountingStatus }</p>
        </div>
        <div>
          <p style={{ fontSize: 'var(--font-md)' }}><strong>Shipping Status</strong></p>
          <p style={{ color: 'var(--yellow-1)' }}>{ shippingStatus }</p>
        </div>
      </div>
    }
    </GridItem>
  );
}
