import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getCustomerTagById = async (tagId: number, customerId: number): Promise<Tag | null> => {
  try {
    const res = await api.get('/api/tags/id/customer', { params: { tagId, customerId } });
    return res.data;
  } catch (error) {
    handleError(error, 'getCustomerTagById');
    return null;
  }
};

export const getTags = async (type: TagType): Promise<Tag[]> => {
  try {
    const res = await api.get('/api/tags', { params: { type } });
    return res.data;
  } catch (error) {
    handleError(error, 'getTags');
    return [];
  }
};

// === POST routes === //

export const addTagToCustomer = async (customerId: number, tagId: number) => {
  try {
    const res = await getCustomerTagById(tagId, customerId);
    if (res) return;

    await api.post('/api/tags/customer', { customerId, tagId });
  } catch (error) {
    handleError(error, 'addTagToCustomer');
  }
};

// === DELETE routes === //

export const deleteTagFromCustomer = async (customerId: number, tagId: number) => {
  try {
    await api.delete(`/api/tags/customer`, { params: { customerId, tagId } });
  } catch (error) {
    handleError(error, 'deleteTagFromCustomer');
  }
};
