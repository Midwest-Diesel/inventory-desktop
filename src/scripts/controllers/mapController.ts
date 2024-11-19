import api from "../config/axios";


// === GET routes === //

export const getMapLocations = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/map', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addMapLocation = async (loc: any) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/map', loc, auth);
    return (res as any).data.id;
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteMapLocation = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/map/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
