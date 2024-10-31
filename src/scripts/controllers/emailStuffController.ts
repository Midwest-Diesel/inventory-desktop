import api from "../config/axios";


// === GET routes === //

export const getAllEmailStuff = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/email-stuff', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addEmailStuffItem = async (payload: EmailStuff) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/email-stuff', payload, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEmailStuffItem = async (payload: EmailStuff) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/email-stuff', payload, auth);
  } catch (err) {
    console.error(err);
  }
};
