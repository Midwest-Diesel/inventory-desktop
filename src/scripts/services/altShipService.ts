import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getAltShipByCustomerId = async (customerId: number): Promise<AltShip[]> => {
  try {
    if (!customerId) return [];
    const res = await api.get(`/api/alt-ship/${customerId}`);
    return res.data;
  } catch (error) {
    handleError(error, 'getAltShipByCustomerId');
    return [];
  }
};

// === POST routes === //

export const addAltShipAddress = async (altShip: AltShip) => {
  try {
    await api.post('/api/alt-ship', altShip);
  } catch (error) {
    handleError(error, 'addAltShipAddress');
  }
};

// === PUT routes === //

export const editAltShipAddress = async (altShip: AltShip) => {
  try {
    await api.put('/api/alt-ship', altShip);
  } catch (error) {
    handleError(error, 'editAltShipAddress');
  }
};

// === DELETE routes === //

export const deleteAltShipAddress = async (id: number) => {
  try {
    await api.delete(`/api/alt-ship/${id}`);
  } catch (error) {
    handleError(error, 'deleteAltShipAddress');
  }
};
