import { createContext, useContext, useState } from "react";



const TokenContext = createContext();


export function TokenProvider({ children }) {

    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    return (
        <TokenContext.Provider value={{ token, setToken, user, setUser }}>
            {children}
        </TokenContext.Provider>
    );
}



export const useToken = () => {
    return useContext(TokenContext);
}
