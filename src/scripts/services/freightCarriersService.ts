import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getAllFreightCarriers = async () => {
  try {
    const res = await api.get('/api/freight-carriers');
    return res.data;
  } catch (error) {
    handleError(error, 'getAllFreightCarriers');
  }
};

export const getFreightCarrierById = async (id: number | null) => {
  try {
    if (!id) return null;
    const res = await api.get(`/api/freight-carriers/${id}`);
    return res.data;
  } catch (error) {
    handleError(error, 'getFreightCarrierById');
  }
};
