import {createContext, useContext, useEffect, useState} from "react";
import {login as performLogin} from "../services/api.js";
import {jwtDecode} from 'jwt-decode'
import {PublicClientApplication} from "@azure/msal-browser";
import {msalConfig} from "@/Utils/msalAuthConfig.js";
import {useMsal} from "@azure/msal-react";
import {useNavigate} from "react-router-dom";
const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user , setUser] = useState(null);
    const [selectedPage, setSelectedPage] = useState(() => {
        return localStorage.getItem('selectedPage') || 'dashboard';
    });
    const [filtersApplied , setFiltersApplied] = useState(false);
    const [usersFiltersApplied , setUsersFiltersApplied] = useState(false);

    const msalInstance = new PublicClientApplication(msalConfig);

    const { instance } = useMsal();


    const setUserFromToken = () => {
        let token = localStorage.getItem("jwtToken");
        let user_data = localStorage.getItem("user_data");
        if(token && user_data) {
            const data = JSON.parse(user_data);
            setUser({
                fullName : data.fullName,
                role : data.role,
                id : data.id
            });
        }
    }

    useEffect(() => {
        localStorage.setItem('selectedPage', selectedPage);
    }, [selectedPage]);

    useEffect(()=> {
        setUserFromToken();
    }, [])

    let getUserData = () => localStorage.getItem("user_data");

    const login = async (usernameAndPassword) => {
        return new Promise((resolve, reject) => {
            performLogin(usernameAndPassword).then(res => {
                const jwtToken = res.data["token"];
                const decodedToken = jwtDecode(jwtToken);
                localStorage.setItem("jwtToken", jwtToken);
                localStorage.setItem("user_data" , JSON.stringify({
                    fullName: decodedToken.fullName,
                    id : decodedToken.sub,
                    role : decodedToken.role
                }));
                console.log(decodedToken);
                setUser({
                    id  : decodedToken.sub,
                    fullName: decodedToken.fullName,
                    role : decodedToken.role,
                })
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }



    const logout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user_data");
        localStorage.removeItem("selectedPage");
        setUser(null);



        instance.logoutPopup( {
            account: instance.getActiveAccount(),
            postLogoutRedirectUri: '/',
            mainWindowRedirectUri: '/'
        })
            .then(() => {
                console.log("Logged out successfully & cache cleared");



            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });

    };


    const isUserAuthenticated = () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            return false;
        }
        const { exp: expiration } = jwtDecode(token);
        if (Date.now() > expiration * 1000) {
            logout()
            return false;
        }
        return true;
    }

    return (
        <AuthContext.Provider
            value={{
                login,
                logout,
                isUserAuthenticated,
                setUserFromToken,
                user,
                selectedPage ,
                filtersApplied ,
                usersFiltersApplied,
                setUsersFiltersApplied,
                setFiltersApplied,
                setSelectedPage,
                getUserData,
                msalInstance
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;