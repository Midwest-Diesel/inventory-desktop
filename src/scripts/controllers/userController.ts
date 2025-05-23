import api from "../config/axios";
import schedule from 'node-schedule';

interface UserLogin {
  username: string
  password: string
}

// === GET routes === //

export const getUser = async () => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };
    const res = await api.get('/api/account', config);
    // Disable deprecated warning message
    if (process.env.NODE_ENV === 'development') {
      // const originalError = console.error;
      // console.error = (...args: any) => {
      //   if (location.pathname !== '/' && args[0].includes('findDOMNode is deprecated')) return;
      //   originalError(...args);
      // };
    }
    return res.data.user;
  } catch (err) {
    console.error(`Unrelated Error: ${err}`);
  }
};

export const getAllUsers = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/account/all', auth);
    return res.data;
  } catch (err) {
    console.error(`Unrelated Error: ${err}`);
  }
};

const checkSession = async () => {
  try {
    const auth = { withCredentials: true };
    await api.get('/api/account/session-check', auth);
  } catch (err) {
    location.reload();
  }
};
schedule.scheduleJob('0 6 * * *', () => checkSession());

// === POST routes === //

export const loginUser = async (user: UserLogin) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };
    await api.post('/api/account/authenticate', user, config);
  } catch (err: any) {
    console.error(err);
    return err?.response.data.message;
  }
};

export const logout = async () => {
  try {
    const auth = { withCredentials: true };
    await api.delete('/api/account/logout', auth);
    location.reload();
  } catch (err) {
    console.error(err);
  }
};
