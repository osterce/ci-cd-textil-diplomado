import { useAuthContext as useAuthActions } from "@/hooks/use-auth-context";
import { Navigate, Outlet } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

function ChangePasswordCard({ onChange }: { onChange: (p: string) => Promise<void> }) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (password.length < 9) {
      toast.error("La contraseña debe tener al menos 9 caracteres")
      return
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setSaving(true)
    try {
      await onChange(password)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle className="pb-3">Primer inicio de sesión</CardTitle>
            <CardDescription>
              <p>Por seguridad, cambia tu contraseña inicial.</p>
              <p className="mt-2">La contraseña debe cumplir los siguientes requisitos:</p>
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>La longitud de la contraseña debe ser mayor o igual a 12 caracteres</li>
                <li>Debe contener al menos una letra</li>
                <li>Debe contener al menos un número</li>
                <li>Debe contener al menos un carácter especial (por ejemplo: !@#$%)</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={password.length > 0 ? (password.length >= 12 ? "border-green-500" : "border-red-500") : undefined}
              />
              {password.length > 0 ? (
                (() => {
                  const rules = {
                    length: password.length >= 12,
                    letter: /[A-Za-z]/.test(password),
                    number: /\d/.test(password),
                    special: /[^A-Za-z0-9]/.test(password),
                  }
                  const all = Object.values(rules).every(Boolean)
                  return (
                    <div>
                      {all ? <p className="text-xs text-green-600">Contraseña válida</p> : (
                        <ul className="mt-2 ml-4 list-disc text-sm text-red-600">
                          {!rules.length ? <li>La longitud debe ser al menos 12 caracteres</li> : null}
                          {!rules.letter ? <li>Debe contener al menos una letra</li> : null}
                          {!rules.number ? <li>Debe contener al menos un número</li> : null}
                          {!rules.special ? <li>Debe contener al menos un carácter especial</li> : null}
                        </ul>
                      )}
                    </div>
                  )
                })()
              ) : null}

              <Label>Verificar contraseña</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={confirm.length > 0 ? (confirm === password ? "border-green-500" : "border-red-500") : undefined}
              />
              {confirm.length > 0 ? (
                confirm === password ? (
                  <p className="text-xs text-green-600">Las contraseñas coinciden</p>
                ) : (
                  <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
                )
              ) : null}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-end">
              <Button onClick={submit} disabled={saving || password.length < 9 || confirm !== password}>{saving ? "Guardando..." : "Cambiar contraseña"}</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
//import { toast } from "sonner";


const AdminLayout = () => {

  const { isAuthenticated } = useAuthActions();
  const { mustChangePassword, changePassword } = useAuthActions();

  // Redirigir si el usuario no esta autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
              {mustChangePassword ? <ChangePasswordCard onChange={async (p) => {
                const res = await changePassword(p)
                if (res.ok) {
                  toast.success("Contraseña actualizada. Cuenta activada")
                } else {
                  toast.error(`Error: ${res.msg || "unknown"}`)
                }
              }} /> : null}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
export default AdminLayout