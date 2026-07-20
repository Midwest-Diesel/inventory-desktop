import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { deleteTagFromCustomer } from "./tagsService";

interface Search {
  customerId?: number
  salesmanId?: number
}


const parseData = (data: any) => {
  return data.map((d: any) => {
    return { ...d, dateAdded: parseResDate(d.dateAdded) };
  });
};

// === GET routes === //

export const getPersonalContactsList = async (params: Search): Promise<PersonalContact[]> => {
  try {
    const res = await api.get('/api/personal-contacts-list', { params });
    return parseData(res.data);
  } catch (error) {
    console.error(error);
    alert(`Error in [getPersonalContactsList] ${error}`);
    return [];
  }
};

// === POST routes === //

export const addPersonalContact = async (customerId: number, salesmanId: number) => {
  try {
    await api.post('/api/personal-contacts-list', { customerId, salesmanId });
  } catch (error) {
    console.error(error);
    alert(`Error in [addPersonalContact] ${error}`);
  }
};

// === DELETE routes === //

export const deletePersonalContact = async (contact: PersonalContact) => {
  try {
    await api.delete(`/api/personal-contacts-list/${contact.id}`);
    
    const res = await getPersonalContactsList({ customerId: contact.customerId });
    if (res.length === 0) {
      await deleteTagFromCustomer(contact.customerId, 1);
    }
  } catch (error) {
    console.error(error);
    alert(`Error in [deletePersonalContact] ${error}`);
  }
};
