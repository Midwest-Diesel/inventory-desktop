import { formatCurrency, parseDateInputValue } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Input from "../library/Input";
import Table from "../library/Table";

interface Props {
  handwritten: Handwritten
  handwrittenItems: HandwrittenItem[]
  handleCoreCharge: (item: HandwrittenItem) => void
  toggleQuickPick: (item: HandwrittenItem) => void
  quickPickItemId: number
  handleEditItem: (item: HandwrittenItem, index: number) => void
  handleDeleteItem: (item: HandwrittenItem) => void
}


export default function EditHandwrittenItemsTable({ handwritten, handwrittenItems, handleCoreCharge, toggleQuickPick, quickPickItemId, handleEditItem, handleDeleteItem }: Props) {
  const getTotalCost = (): number => {
    return handwritten.handwrittenItems
      .reduce((acc, item) => acc + ((item.cost ?? 0) * (item.qty ?? 0)), 0);
  };
  const getInvoiceTotal = (): number => {
    return handwritten.handwrittenItems
      .reduce((acc, item) => acc + ((item.unitPrice ?? 0) * (item.qty ?? 0)), 0);
  };
  const totalColorStyle = getInvoiceTotal() < 0 ? { color: 'var(--red-2)' } : '';


  return (
    <>
      <p><strong>Invoice Total: </strong><span style={{ ...totalColorStyle }}>{ formatCurrency(getInvoiceTotal()) }</span></p>
      <p><strong>Cost Total: </strong>{ formatCurrency(getTotalCost()) }</p>
      <Table variant={['plain', 'edit-row-details']}>
        <thead>
          <tr>
            <th></th>
            <th style={{ color: 'white' }}>Date</th>
            <th style={{ color: 'white' }}>Stock Number</th>
            <th style={{ color: 'white' }}>Location</th>
            <th style={{ color: 'white' }}>Cost</th>
            <th style={{ color: 'white' }}>Qty</th>
            <th style={{ color: 'white' }}>Part Number</th>
            <th style={{ color: 'white' }}>Description</th>
            <th style={{ color: 'white' }}>Unit Price</th>
            { handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' && <th style={{ color: 'white' }}></th> }
          </tr>
        </thead>
        <tbody>
          {handwrittenItems.map((item: HandwrittenItem, i: number) => {
            const isDisabled = handwritten.invoiceStatus === 'SENT TO ACCOUNTING';
            return (
              <tr key={i}>
                <td>
                  {!isDisabled && item.location && !item.location.includes('CORE DEPOSIT') && item.invoiceItemChildren.length === 0 &&
                    <Button
                      variant={['x-small']}
                      onClick={() => handleCoreCharge(item)}
                      data-testid="core-charge-btn"
                      type="button"
                    >
                      Core Charge
                    </Button>
                  }
                  {!isDisabled && item.invoiceItemChildren.some((i) => i.stockNum === 'In/Out') &&
                    <Button
                      variant={['x-small']}
                      onClick={() => toggleQuickPick(item)}
                      type="button"
                    >
                      { quickPickItemId > 0 ? 'Disable' : 'Enable' } Quick Pick
                    </Button>
                  }
                </td>
                <td>
                  <Input
                    value={parseDateInputValue(item.date)}
                    onChange={(e) => handleEditItem({ ...item, date: new Date(e.target.value) }, i)}
                    type="date"
                  />
                </td>
                <td>
                  <Input
                    value={item.stockNum ?? ''}
                    onChange={(e) => handleEditItem({ ...item, stockNum: e.target.value }, i)}
                    disabled={isDisabled}
                  />
                </td>
                <td>
                  <Input
                    value={item.location ?? ''}
                    onChange={(e) => handleEditItem({ ...item, location: e.target.value }, i)}
                    disabled={isDisabled}
                  />
                </td>
                <td>
                  <Input
                    value={item.cost ?? ''}
                    onChange={(e) => handleEditItem({ ...item, cost: e.target.value ? Number(e.target.value) : null }, i)}
                    disabled={isDisabled}
                    data-testid="item-cost"
                    type="number"
                    step="any"
                  />
                </td>
                <td>
                  <Input
                    value={item.qty ?? ''}
                    type="number"
                    onChange={(e) => handleEditItem({ ...item, qty: e.target.value ? Number(e.target.value) : null }, i)}
                    disabled={isDisabled}
                    data-testid="item-qty"
                  />
                </td>
                <td>
                  <Input
                    value={item.partNum ?? ''}
                    onChange={(e) => handleEditItem({ ...item, partNum: e.target.value }, i)}
                    disabled={isDisabled}
                  />
                </td>
                <td>
                  <Input
                    value={item.desc ?? ''}
                    onChange={(e) => handleEditItem({ ...item, desc: e.target.value }, i)}
                    disabled={isDisabled}
                    data-testid="item-desc"
                  />
                </td>
                <td>
                  <Input
                    value={item.unitPrice ?? ''}
                    onChange={(e) => handleEditItem({ ...item, unitPrice: e.target.value ? Number(e.target.value) : null }, i)}
                    disabled={isDisabled}
                    type="number"
                    step="any"
                  />
                </td>
                {handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' &&
                  <td>
                    <Button
                      variant={['danger']}
                      onClick={() => handleDeleteItem(item)}
                      type="button"
                      data-testid="item-delete-btn"
                    >
                      Delete
                    </Button>
                  </td>
                }
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
