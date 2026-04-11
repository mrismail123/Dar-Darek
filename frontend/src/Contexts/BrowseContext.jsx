import { createContext  , useContext , useState} from "react";

const BrowseContext = createContext({});


export function BrowseProvider({children}){

    // $$$$$$$$$$$$$$$$ Browsing states $$$$$$$$$$$$$$$$$$$$$$$$$$

    const [browse , setBrowse] = useState({
        Location : "",
        checkIn :null,
        checkOut : null,
        guests : {
            adults : 0,
            children :0,
            pets: 0
        }
    })
    
    
    // $$$$$$$$$$$$$$$ End Browsing states $$$$$$$$$$$$$$$$$$$$


    return (
        <BrowseContext.Provider value={{browse , setBrowse}}>
            {children}
        </BrowseContext.Provider>
    )
}

export const useBrowse = ()=>{
    return useContext(BrowseContext)
}