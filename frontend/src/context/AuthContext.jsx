
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("accessToken")
    );

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const data = response.data;

        localStorage.setItem("accessToken", data.accessToken);

        const userData = {
            email: data.email,
            role: data.role,
            tenantId: data.tenantId,
        };

        localStorage.setItem("user", JSON.stringify(userData));

        setToken(data.accessToken);
        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
