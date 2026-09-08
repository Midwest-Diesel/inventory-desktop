import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getWatchedPricingRows = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/pricing-changes');
    return res.data;
  } catch (error) {
    handleError(error, 'getWatchedPricingRows');
    return [];
  }
};

// === POST routes === //

export const addWatchedPricingRow = async (partNum: string) => {
  try {
    await api.post('/api/pricing-changes', { partNum });
  } catch (error) {
    handleError(error, 'addWatchedPricingRow');
  }
};

// === DELETE routes === //

export const deleteWatchedPricingRow = async (partNum: string) => {
  try {
    await api.delete(`/api/pricing-changes/${partNum}`);
  } catch (error) {
    handleError(error, 'deleteWatchedPricingRow');
  }
};
