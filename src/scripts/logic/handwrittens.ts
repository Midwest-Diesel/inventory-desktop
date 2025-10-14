import { ask } from "../config/tauri";
import { addCore } from "../services/coresService";
import { addHandwrittenItem } from "../services/handwrittensService";


export const paymentTypes = ['Net 30', 'Wire Transfer', 'EBPP - Secure', 'Visa', 'Mastercard', 'AMEX', 'Discover', 'Comchek', 'T-Check', 'Check', 'Cash', 'Card on File', 'Net 10', 'No Charge'].sort();

export const addCoreCharge = async (handwritten: Handwritten, item: HandwrittenItem): Promise<boolean> => {
  if (!await ask('Are you sure you want to add a core charge?') || handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return false;
  const newItem = {
    handwrittenId: handwritten.id,
    date: new Date(),
    desc: item.desc,
    partNum: 'CORE DEPOSIT',
    stockNum: item.stockNum,
    unitPrice: Number(item.unitPrice),
    qty: Number(item.qty),
    cost: 0.01,
    location: 'CORE DEPOSIT',
    partId: item.partId
  };
  const newItemId = await addHandwrittenItem(newItem);
  
  const priority = await ask('Is this HIGH priority?') ? 'High' : 'Low';
  const newCore = {
    date: new Date(),
    qty: item.qty,
    partNum: item.partNum,
    desc: item.desc,
    unitPrice: item.unitPrice,
    customerId: handwritten.customer.id,
    partInvoiceId: item.handwrittenId,
    handwrittenId: handwritten.id,
    billToCompany: handwritten.billToCompany,
    shipToCompany: handwritten.shipToCompany,
    charge: item.unitPrice,
    priority,
    salesmanId: handwritten.soldById,
    partId: item.partId,
    handwrittenItemId: newItemId
  } as any;
  await addCore(newCore);
  return true;
};
