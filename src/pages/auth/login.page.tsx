// CardFooterAuth intentionally not used on login to hide registration prompt
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginZodSchema, type LoginZodSchemaType } from "@/lib/zod.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IconMail, IconLock } from "@tabler/icons-react"
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
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Bienvenido</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulario de inicio de sesión */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@correo.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
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
                    <div className="relative">
                      <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
              size="lg"
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