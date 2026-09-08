import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";
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
    handleError(error, 'getPersonalContactsList');
    return [];
  }
};

// === POST routes === //

export const addPersonalContact = async (customerId: number, salesmanId: number) => {
  try {
    await api.post('/api/personal-contacts-list', { customerId, salesmanId });
  } catch (error) {
    handleError(error, 'addPersonalContact');
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
    handleError(error, 'deletePersonalContact');
  }
};
