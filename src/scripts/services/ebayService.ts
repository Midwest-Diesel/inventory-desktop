import api from "../config/axios";
import { getPartTypeFromDesc } from "../logic/addOns";
import { getEngineByStockNum } from "./enginesService";

interface EditEbayItemQty {
  offerId: string | null
  sku: string
  qty: number
}

interface Offer {
  offerId: string
}


const parseItemCondition = (condition: string | null, manufacturer: string | null): string => {
  if (manufacturer === 'New') return 'New, Other';

  switch (condition) {
    case 'New':
      return 'NEW_OTHER';
    case 'Good Used':
      return 'USED_GOOD';
    case 'Core':
      return 'FOR_PARTS_OR_NOT_WORKING';
    case 'Reconditioned':
      return 'GOOD_REFURBISHED';
    default:
      return '';
  }
};

const parseItemManufacturer = (manufacturer: string | null): string | null => {
  switch (manufacturer) {
    case 'New Cat':
      return 'Caterpillar';
    case 'New':
      return null;
    default:
      return null;
  }
};

const getItemTitleFromAddOn = async (addOn: AddOn) => {
  const engine = await getEngineByStockNum(addOn.engineNum);
  const engineType = engine?.model ? ` ${engine.model}` : '';
  const partType = addOn.desc ? ` ${getPartTypeFromDesc(addOn.desc) ?? ''}` : '';
  return `${addOn.manufacturer} ${addOn.partNum} ${addOn.desc}(${engineType}) ${addOn.condition}${partType}`;
};

// === GET routes === //

export const getAddonItemFromSku = async (sku: string): Promise<any | null> => {
  try {
    const res = await api.get(`/api/ebay/add-ons/sku/${sku}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOfferBySku = async (sku: string): Promise<Offer | null> => {
  try {
    const params = { sku };
    const res = await api.get(`/api/ebay/offer/sku`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === POST routes === //

export const addEbayItem = async (addOn: AddOn) => {
  try {
    const desc = await getItemTitleFromAddOn(addOn);
    const item = {
      addOnQty: addOn.qty,
      partNum: addOn.partNum,
      stockNum: addOn.stockNum,
      condition: parseItemCondition(addOn.condition, addOn.manufacturer),
      manufacturer: parseItemManufacturer(addOn.manufacturer),
      title: desc,
      desc
    };
    await api.post('/api/ebay/item', item);
  } catch (error) {
    console.error(error);
    alert(`Error in [addEbayItem] ${error}`);
  }
};

// === PATCH routes === //

export const editEbayItemQty = async (params: EditEbayItemQty) => {
  try {
    const body = {
      requests: [
        {
          offers: [
            {
              availableQuantity: params.qty,
              offerId: params.offerId
            }
          ],
          shipToLocationAvailability: { quantity: params.qty },
          sku: params.sku
        }
      ]
    };
    await api.patch('/api/ebay/edit-qty', body);

    const ebayAddOnItem = await getAddonItemFromSku(params.sku);
    if (!ebayAddOnItem) return alert('Error finding item');
    
    await editEbayAddonItem({ ...ebayAddOnItem, qty: params.qty });
  } catch (error) {
    console.error(error);
    alert(`Error in [editEbayItemQty] ${error}`);
  }
};

// === PUT routes === //

export const editEbayAddonItem = async (ebayAddOnItem: any) => {
  try {
    await api.put(`/api/ebay/item`, ebayAddOnItem);
  } catch (error) {
    console.error(error);
    alert(`Error in [editEbayAddonItem] ${error}`);
  }
};
