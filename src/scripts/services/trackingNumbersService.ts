import api from "../config/axios";


// === POST routes === //

export const addTrackingNumber = async (handwrittenId: number, trackingNumber: string) => {
  try {
    await api.post('/api/tracking-numbers', { handwrittenId, trackingNumber });
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editTrackingNumber = async (id: number, trackingNumber: string) => {
  try {
    await api.patch('/api/tracking-numbers', { id, trackingNumber });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteTrackingNumber = async (id: number) => {
  try {
    await api.delete(`/api/tracking-numbers/${id}`);
  } catch (err) {
    console.error(err);
  }
};
