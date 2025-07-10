import api from "../config/axios";


// === GET routes === //

export const getWatchedPricingRows = async (): Promise<string[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/pricing-changes', auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addWatchedPricingRow = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/pricing-changes', { partNum }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteWatchedPricingRow = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/pricing-changes/${partNum}`, auth);
  } catch (err) {
    console.error(err);
  }
};
