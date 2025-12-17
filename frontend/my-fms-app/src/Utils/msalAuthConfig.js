export const msalConfig = {
    auth: {
        clientId: `${import.meta.env.VITE_AZURE_CLIENT_ID}`,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "http://localhost:80/home",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: [
        "Files.ReadWrite.All",
        "User.Read"
    ],
};
