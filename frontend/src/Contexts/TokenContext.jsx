import { Children, createContext, useContext, useEffect, useState } from "react";



const TokenContext = createContext();


export function TokenProvider({ children }) {

    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
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
