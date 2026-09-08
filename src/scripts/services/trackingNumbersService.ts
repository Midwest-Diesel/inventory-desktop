import api from "../config/axios";
import { handleError } from "../tools/utils";


// === POST routes === //

export const addTrackingNumber = async (handwrittenId: number, trackingNumber: string) => {
  try {
    await api.post('/api/tracking-numbers', { handwrittenId, trackingNumber });
  } catch (error) {
    handleError(error, 'addTrackingNumber');
  }
};

// === PATCH routes === //

export const editTrackingNumber = async (id: number, trackingNumber: string) => {
  try {
    await api.patch('/api/tracking-numbers', { id, trackingNumber });
  } catch (error) {
    console.error(error, 'editTrackingNumber');
  }
};

// === DELETE routes === //

export const deleteTrackingNumber = async (id: number) => {
  try {
    await api.delete(`/api/tracking-numbers/${id}`);
  } catch (error) {
    console.error(error, 'deleteTrackingNumber');
  }
};
