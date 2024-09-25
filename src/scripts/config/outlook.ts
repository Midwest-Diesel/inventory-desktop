import * as msal from "@azure/msal-browser";


const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_OUTLOOK_TENANT_ID}`,
    redirectUri: "http://localhost:3000",
  },
};
const msalInstance = new msal.PublicClientApplication(msalConfig);

export const initApp = async () => {
  try {
    await msalInstance.initialize();
  } catch (error) {
    console.error(error);
  };
};

const getAuthToken = async () => {
  const config = {
    scopes: ["Mail.Send"],
  };
  const res = await msalInstance.loginPopup(config);
  return res.accessToken;
};


export const newDraftEmail = async (email: Email) => {
  try {
    const token = await getAuthToken();
    await fetch('https://graph.microsoft.com/v1.0/me/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(email)
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
