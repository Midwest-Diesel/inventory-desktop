import api from "../config/axios";


// === GET routes === //

export const getShippingList = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/shipping-list', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addToShippingList = async (row: any) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/shipping-list', row, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editShippingListRow = async (row: ShippingList) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/shipping-list', row, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteShippingListRow = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/shipping-list/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
