import api from "../config/axios";


// === GET routes === //

export const getTags = async (type: TagType): Promise<Tag[]> => {
  try {
    const res = await api.get('/api/tags', { params: { type } });
    return res.data;
  } catch (error) {
    console.error(error);
    alert(`Error in [getTags] ${error}`);
    return [];
  }
};

// === POST routes === //

export const addTagToCustomer = async (customerId: number, tagId: number) => {
  try {
    await api.post('/api/tags/customer', { customerId, tagId });
  } catch (error) {
    console.error(error);
    alert(`Error in [addTagToCustomer] ${error}`);
  }
};

// === DELETE routes === //

export const deleteTagFromCustomer = async (customerId: number, tagId: number) => {
  try {
    await api.delete(`/api/tags/customer`, { params: { customerId, tagId } });
  } catch (error) {
    console.error(error);
    alert(`Error in [deleteTagFromCustomer] ${error}`);
  }
};
