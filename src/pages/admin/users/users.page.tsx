import * as React from "react"
import { IconEdit, IconKey } from "@tabler/icons-react"
import { toast } from "sonner"
import AdminList from "@/components/admin/admin-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

type User = {
  id?: number
  name?: string
  email?: string
  role_id?: number
  isActive?: boolean
}

function CreateUserDrawer({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (u: User) => void }) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", email: "" })
  const [showExistsDialog, setShowExistsDialog] = React.useState(false)

  const validate = React.useCallback(() => {
    const errors: { name?: string; email?: string } = {}
    if (!form.name || form.name.trim().length < 3) errors.name = "El nombre debe tener al menos 3 caracteres"
    // simple email regex
    const emailRx = /^\S+@\S+\.\S+$/
    if (!form.email || !emailRx.test(form.email)) errors.email = "Email no válido"
    return errors
  }, [form])

  const errors = validate()

  const submit = async () => {
    // client-side validation before sending
    const currentErrors = validate()
    if (Object.keys(currentErrors).length > 0) {
      // show the first error as toast and avoid submitting
      const first = Object.values(currentErrors)[0]
      if (first) toast.error(String(first))
      return
    }

    setSaving(true)
    try {
      const res = await fetch("http://localhost:3001/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend requires a password; send default password
        body: JSON.stringify({ name: form.name, email: form.email, password: "123456" }),
      })
      
      if (res.status === 409) {
        setShowExistsDialog(true)
        setSaving(false)
        return
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const created = (data && data.msg && typeof data.msg === "object") ? data.msg : ({} as User)
      onCreated(created as User)
      onOpenChange(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error creando usuario: ${maybe.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AlertDialog open={showExistsDialog} onOpenChange={setShowExistsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuario existente</AlertDialogTitle>
            <AlertDialogDescription>
              El email <strong>{form.email}</strong> ya está registrado en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowExistsDialog(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Crear usuario</DrawerTitle>
            <DrawerDescription>Rellena los datos para crear un nuevo usuario</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-3">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
          </div>

          <DrawerFooter>
            <div className="w-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Crear"}</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function EditUserDrawer({ user, onSaved, refetch }: { user: User; onSaved?: (u: User) => void; refetch?: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)
  const [form, setForm] = React.useState({ name: user.name ?? "", email: user.email ?? "", role_id: user.role_id ?? undefined, isActive: !!user.isActive })
  const [roles, setRoles] = React.useState<Array<{ id: number; name: string }>>([])
  const [showExistsDialog, setShowExistsDialog] = React.useState(false)

  React.useEffect(() => {
    if (open) setForm({ name: user.name ?? "", email: user.email ?? "", role_id: user.role_id ?? undefined, isActive: !!user.isActive })
  }, [open, user])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/v1/roles")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items = (data && data.msg) ? data.msg : data
        if (mounted) setRoles(Array.isArray(items) ? items : [])
      } catch (err) {
        const maybe = err as { message?: string }
        toast.error(`Error cargando roles: ${maybe.message || String(err)}`)
      }
    }

    if (open) load()
    return () => { mounted = false }
  }, [open])

  const save = async () => {
    if (!user.id) return
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:3001/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, isActive: form.isActive, role_id: form.role_id }),
      })
      
      if (res.status === 409 || res.status === 500) {
        const data = await res.json()
        // Check if it's a duplicate email error
        if (data.error && data.error.includes("duplicate key") && data.error.includes("users_email_key")) {
          setShowExistsDialog(true)
          setSaving(false)
          return
        }
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const updated = (data && data.msg && typeof data.msg === "object") ? data.msg : { id: user.id, name: form.name, email: form.email, isActive: form.isActive }
      if (typeof onSaved === "function") onSaved(updated as User)
      if (refetch) await refetch()
      toast.success("Usuario actualizado")
      setOpen(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error actualizando: ${maybe.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const resetPassword = async () => {
    if (!user.id) return
    setResetting(true)
    try {
      const res = await fetch(`http://localhost:3001/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "123456" }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      toast.success("Contraseña reiniciada a 123456")
      if (refetch) await refetch()
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error reiniciando contraseña: ${maybe.message || String(err)}`)
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <AlertDialog open={showExistsDialog} onOpenChange={setShowExistsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email existente</AlertDialogTitle>
            <AlertDialogDescription>
              El email <strong>{form.email}</strong> ya está registrado por otro usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowExistsDialog(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <IconEdit />
      </Button>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar usuario</DrawerTitle>
            <DrawerDescription>Actualizar los datos del usuario</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-3">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            <Label>Rol</Label>
            <Select value={form.role_id ? String(form.role_id) : ""} onValueChange={(v) => setForm((s) => ({ ...s, role_id: v ? Number(v) : undefined }))}>
              <SelectTrigger size="default">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
              <span className="text-sm">Activo</span>
            </div>
          </div>

          <DrawerFooter>
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={resetting}>
                      {resetting ? "Procesando..." : (
                        <>
                          <IconKey className="mr-1" />
                          Reiniciar contraseña
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reiniciar contraseña</AlertDialogTitle>
                      <AlertDialogDescription>¿Estás seguro que quieres reiniciar la contraseña de este usuario a <strong>123456</strong>?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={resetPassword}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default function UsersPage() {
  // initialize with a no-op so children can call it without null checks
  const refetchRef = React.useRef<() => Promise<void>>(async () => Promise.resolve())

  const [roles, setRoles] = React.useState<Array<{ id: number; name: string }>>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/v1/roles")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items = (data && data.msg) ? data.msg : data
        if (mounted) setRoles(Array.isArray(items) ? items : [])
      } catch (err) {
        const maybe = err as { message?: string }
        toast.error(`Error cargando roles: ${maybe.message || String(err)}`)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  type ColumnUser = { key: string; label: string; sortable?: boolean; cell: (u: User) => React.ReactNode }

  const rolesMap = React.useMemo(() => {
    const m = new Map<number, string>()
    roles.forEach((r) => m.set(r.id, r.name))
    return m
  }, [roles])

  const columns = React.useMemo<ColumnUser[]>(() => {
    const cols: ColumnUser[] = [
      { key: "id", label: "ID", sortable: true, cell: (u: User) => u.id ?? "-" },
      { key: "name", label: "Nombre", sortable: true, cell: (u: User) => u.name ?? "-" },
      { key: "email", label: "Email", sortable: true, cell: (u: User) => u.email ?? "-" },
      { key: "role", label: "Rol", sortable: true, cell: (u: User) => (u.role_id != null ? (rolesMap.get(u.role_id) ?? String(u.role_id)) : "-") },
      { key: "isActive", label: "Estado", sortable: true, cell: (u: User) => (u.isActive ? <Badge variant="secondary">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>) },
      { key: "actions", label: "", cell: (u: User) => <EditUserDrawer user={u} refetch={() => refetchRef.current()} /> },
    ]
    return cols
  }, [rolesMap])

  return (
    <AdminList<User>
      title="Usuarios"
      description="Administración de usuarios del sistema"
      fetchUrl="http://localhost:3001/api/v1/users"
      rolesUrl="http://localhost:3001/api/v1/roles"
  columns={columns}
      renderCreateDrawer={({ open, onOpenChange, onCreated }) => (
        <CreateUserDrawer open={open} onOpenChange={onOpenChange} onCreated={onCreated} />
      )}
      onRefetchReady={(fn) => { refetchRef.current = fn }}
    />
  )
}