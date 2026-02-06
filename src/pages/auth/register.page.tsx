import CardFooterAuth from "@/components/card-footer-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext as useAuthActions } from "@/hooks/use-auth-context"

const RegisterPage = () => {
  const { loading } = useAuthActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Registro de usuario</CardTitle>
        <CardDescription>Regístrate con tu correo electrónico y contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulario de registro */}
        ...
      </CardContent>
      <CardFooterAuth
        type="register"
        loading={loading}
      />
    </Card>
  )
}
export default RegisterPage