import api from "../config/axios";


// === GET routes === //

export const getWatchedPricingRows = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/pricing-changes');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// === POST routes === //

export const addWatchedPricingRow = async (partNum: string) => {
  try {
    await api.post('/api/pricing-changes', { partNum });
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteWatchedPricingRow = async (partNum: string) => {
  try {
    await api.delete(`/api/pricing-changes/${partNum}`);
  } catch (error) {
    console.error(error);
  }
};
