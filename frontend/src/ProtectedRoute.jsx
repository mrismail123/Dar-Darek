import { useToken } from "./Contexts/TokenContext"
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }){

    const { token, user } = useToken();


    if(!token){
        return <Navigate to="/Authentication" replace />
    }

    if (user?.role === "admin" && requiredRole !== "admin") {
        return <Navigate to="/admin" replace />
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children;
}
