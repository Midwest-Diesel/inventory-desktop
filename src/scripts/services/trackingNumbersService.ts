import api from "../config/axios";


// === POST routes === //

export const addTrackingNumber = async (handwrittenId: number, trackingNumber: string) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/tracking-numbers', { handwrittenId, trackingNumber }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editTrackingNumber = async (id: number, trackingNumber: string) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/tracking-numbers', { id, trackingNumber }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteTrackingNumber = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/tracking-numbers/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
