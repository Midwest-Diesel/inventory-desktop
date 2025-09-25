import api from "../config/axios";


// === GET routes === //

export const getWatchedPricingRows = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/pricing-changes');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addWatchedPricingRow = async (partNum: string) => {
  try {
    await api.post('/api/pricing-changes', { partNum });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteWatchedPricingRow = async (partNum: string) => {
  try {
    await api.delete(`/api/pricing-changes/${partNum}`);
  } catch (err) {
    console.error(err);
  }
};
