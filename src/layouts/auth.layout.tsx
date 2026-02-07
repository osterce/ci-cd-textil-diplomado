import { useAuthContext as useAuthActions } from "@/hooks/use-auth-context"
import { Navigate, Outlet } from "react-router"
import logo from "@/assets/logo.png"

const AuthLayout = () => {

  //Traer datos del usuario
  const { loading, isAuthenticated } = useAuthActions();
  //Mostrar loadding mientras se verifica el estado de inicio de sesion
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Cargando...</div>
      </div>
    );
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="Textiles logo" className="w-16 h-16 object-contain" />
            <span className="font-semibold font-inspiration text-6xl leading-none text-foreground">
              Textiles
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Sistema de Gestión de Postgrados UCB
          </p>
        </div>

        {/* Form container with glassmorphism effect */}
        <div className="backdrop-blur-sm bg-card/50 border border-border rounded-lg shadow-lg">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 Universidad Católica Boliviana. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
export default AuthLayout