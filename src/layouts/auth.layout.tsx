import { useAuthContext as useAuthActions } from "@/hooks/use-auth-context"
import { Navigate, Outlet } from "react-router"

const AuthLayout = () => {

  //Traer datos del usuario
  const { loading, isAuthenticated } = useAuthActions();
  //Mostrar loadding mientras se verifica el estado de inicio de sesion
  if (loading) {
    return <div>Loading...</div>;
  }
  // Redirigir si el usuario ya está autenticado
  if (isAuthenticated) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <Outlet />
      </div>
    </div>
  )
}
export default AuthLayout