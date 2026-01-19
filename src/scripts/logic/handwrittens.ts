import { ask } from "../config/tauri";
import { addCore } from "../services/coresService";
import { addHandwrittenItem, addHandwrittenItemChild } from "../services/handwrittensService";

interface TakeoffRes {
  item: HandwrittenItem | null
  itemChild: HandwrittenItemChild | null
  parentItem: HandwrittenItem | null
}


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

export const startTakeoff = (input: string, handwritten: Handwritten): TakeoffRes => {
  const stockNum = input.replace('<', '').replace('>', '').toUpperCase();
  const children: HandwrittenItemChild[] = [];
  const item: HandwrittenItem | null = handwritten.handwrittenItems.find((item) => item.stockNum?.toUpperCase() === stockNum && item.location !== 'CORE DEPOSIT') ?? null;
  handwritten.handwrittenItems.forEach((item) => {
    if (item.invoiceItemChildren.length > 0) children.push(...item.invoiceItemChildren);
  });

  if (Number(item?.qty) <= 0) {
    alert('Cannot perform takeoff on item with no qty');
    return { item: null, itemChild: null, parentItem: null };
  }

  const itemChild: HandwrittenItemChild | null = children.find((item) => item.stockNum?.toUpperCase() === stockNum) ?? null;
  const parentItem = itemChild ? handwritten.handwrittenItems.find((i) => i.id === itemChild.parentId) ?? null : null;
  return { item, itemChild, parentItem };
};

export const addQtyInOut = async (handwrittenId: number, desc: string, partNum: string, qty: number, unitPrice: number, isInOut: boolean) => {
  const newItem = {
    handwrittenId,
    date: new Date(),
    desc,
    partNum,
    stockNum: isInOut ? 'IN/OUT' : '',
    unitPrice: unitPrice,
    qty,
    cost: 0.04,
    location: isInOut ? 'IN/OUT' : '',
    partId: null
  };
  const id = await addHandwrittenItem(newItem);

  if (isInOut) {
    const newChild = {
      partId: null,
      qty,
      cost: 0.04,
      partNum,
      stockNum: 'In/Out'
    };
    await addHandwrittenItemChild(Number(id), newChild);
  }
};
