import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PublicRoute = ({ children }) => {
    const { isUserAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isUserAuthenticated()) {
            navigate("/home");
        }
    }, []);

    return !isUserAuthenticated() ? children : null;
};

export default PublicRoute;