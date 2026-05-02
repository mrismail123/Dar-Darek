import { Children, createContext, useContext , useEffect, useState } from "react";



const TokenContext = createContext();


export function TokenProvider({children}){

    const [token , setToken] = useState(null);
    const [user , setUser] = useState(null);

    return (
        <TokenContext.Provider value={{token , setToken , user , setUser}}>
            {children}
        </TokenContext.Provider>
    );  
}



export const useToken = ()=>{
    return useContext(TokenContext);
}