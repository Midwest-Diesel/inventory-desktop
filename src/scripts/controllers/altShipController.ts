import api from "../config/axios";


// === GET routes === //

export const getAltShipByCustomerId = async (customerId: number): Promise<AltShip[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/alt-ship/${customerId}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addAltShipAddress = async (altShip: AltShip) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/alt-ship', altShip, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAltShipAddress = async (altShip: AltShip) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/alt-ship', altShip, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAltShipAddress = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/alt-ship/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
