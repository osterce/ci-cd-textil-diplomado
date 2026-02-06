// CardFooterAuth intentionally not used on login to hide registration prompt
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginZodSchema, type LoginZodSchemaType } from "@/lib/zod.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useAuthContext as useAuthActions } from "@/hooks/use-auth-context"
import { toast } from "sonner"

const LoginPage = () => {
  const { loading, login } = useAuthActions();// Reemplazar con el estado real de carga si es necesario
  const form = useForm<LoginZodSchemaType>({
    resolver: zodResolver(loginZodSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginZodSchemaType) => {
    // Lógica de envío del formulario
    const response = await login(data.email, data.password);
    if (!response.ok) {
      toast.error("El usuario o la contraseña es incorrecta")
      form.setError("email",
        {
          type: "manual",
          message: "Email o contraseña incorrectos",
        }
      );
      form.setError("password",
        {
          type: "manual",
          message: "Email o contraseña incorrectos",
        }
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Inicio de sesión</CardTitle>
        <CardDescription>Inicia sesión con tu correo electrónico y contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulario de inicio de sesión */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ingresa tu correo electrónico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* Footer hidden on login: registration prompt removed as requested */}
    </Card>
  )
}
export default LoginPage