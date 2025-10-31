import api from "../config/axios";
import schedule from 'node-schedule';

interface UserLogin {
  username: string
  password: string
}


// === GET routes === //

export const getUser = async (): Promise<User | null> => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };
    const res = await api.get('/api/account', config);
    return res.data.user;
  } catch (err) {
    console.error(`Unrelated Error: ${err}`);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get('/api/account/all');
    return res.data;
  } catch (err) {
    console.error(`Unrelated Error: ${err}`);
    return [];
  }
};

const checkSession = async () => {
  try {
    await api.get('/api/account/session-check');
  } catch (err) {
    console.error(err);
    location.reload();
  }
};
schedule.scheduleJob('0 6 * * *', () => checkSession());

// === POST routes === //

export const loginUser = async (user: UserLogin) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };
    await api.post('/api/account/authenticate', user, config);
  } catch (err: any) {
    console.error(err);
    return err?.response.data.message;
  }
};

// === DELETE routes === //

export const logout = async () => {
  try {
    await api.delete('/api/account/logout');
    location.reload();
  } catch (err) {
    console.error(err);
  }
};
