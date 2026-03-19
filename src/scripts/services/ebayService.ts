import api from "../config/axios";


const parseItemCondition = (condition: string | null, manufacturer: string | null): string => {
  if (manufacturer === 'New') return 'New, Other';

  switch (condition) {
    case 'New':
      return 'New, Other';
    case 'Good used':
      return 'Used';
    case 'Core':
      return 'For Parts, Not Working';
    case 'Reconditioned':
      return 'Refurbished';
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

const getItemTitleFromAddOn = (addOn: AddOn) => {
  return `${addOn.remarks}, ${addOn.manufacturer}, ${addOn.partNum}, ${addOn.desc}, ${addOn.condition}`;
};

// === POST routes === //

export const addEbayItem = async (addOn: AddOn) => {
  try {
    const item = {
      addOnQty: addOn.qty,
      partNum: addOn.partNum,
      stockNum: addOn.stockNum,
      condition: parseItemCondition(addOn.condition, addOn.manufacturer),
      manufacturer: parseItemManufacturer(addOn.manufacturer),
      title: getItemTitleFromAddOn(addOn),
      desc: getItemTitleFromAddOn(addOn)
    };
    await api.post('/api/ebay/item', item);
  } catch (error) {
    console.error(error);
    alert(`Error in [addEbayItem] ${error}`);
  }
};