import api from "../config/axios";


// === GET routes === //

export const getAltShipByCustomerId = async (customerId: number): Promise<AltShip[]> => {
  try {
    return await api.get(`/api/alt-ship/${customerId}`);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addAltShipAddress = async (altShip: AltShip) => {
  try {
    await api.post('/api/alt-ship', altShip);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAltShipAddress = async (altShip: AltShip) => {
  try {
    await api.put('/api/alt-ship', altShip);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAltShipAddress = async (id: number) => {
  try {
    await api.delete(`/api/alt-ship/${id}`);
  } catch (err) {
    console.error(err);
  }
};
