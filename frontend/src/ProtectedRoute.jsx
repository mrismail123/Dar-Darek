import { useToken } from "./Contexts/TokenContext"
import { Navigate, useNavigate } from "react-router-dom";

export default function ProtectedRoute({children}){

    const {token} = useToken();


    if(!token){
        return <Navigate to="/Authentication" replace />
    }

    return children;
}