import * as React from "react"
import AdminList from "@/components/admin/admin-list"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

type Role = { id?: number; name?: string; description?: string }
type Permission = { id?: number; name?: string; description?: string }

function CreateRoleDrawer({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (r: Role) => void }) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", description: "" })

  const submit = async () => {
    if (!form.name.trim()) return toast.error("El nombre es obligatorio")
    setSaving(true)
    try {
      const res = await fetch("http://localhost:3001/api/v1/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const created = (data && data.msg && typeof data.msg === "object") ? data.msg : ({} as Role)
      onCreated(created as Role)
      onOpenChange(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error creando rol: ${maybe.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Crear rol</DrawerTitle>
          <DrawerDescription>Define un nuevo rol</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 flex flex-col gap-3">
          <Label>Nombre</Label>
          <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          <Label>Descripción</Label>
          <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        </div>

        <DrawerFooter>
          <div className="w-full flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Crear"}</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function EditRoleDrawer({ role, refetch }: { role: Role; refetch?: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: role.name ?? "", description: role.description ?? "" })

  React.useEffect(() => {
    if (open) setForm({ name: role.name ?? "", description: role.description ?? "" })
  }, [open, role])

  const save = async () => {
    if (!role.id) return
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:3001/api/v1/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      if (refetch) await refetch()
      toast.success("Rol actualizado")
      setOpen(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error actualizando rol: ${maybe.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <IconEdit />
      </Button>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar rol</DrawerTitle>
            <DrawerDescription>Actualizar información del rol</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-3">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            <Label>Descripción</Label>
            <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </div>

          <DrawerFooter>
            <div className="w-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

// Manage permissions drawer
function ManageRolePermissionsDrawer({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [permissions, setPermissions] = React.useState<Permission[] | null>(null)
  const [assigned, setAssigned] = React.useState<Record<number, boolean>>({})
  const [savingIds, setSavingIds] = React.useState<Record<number, boolean>>({})

  // Assumptions made:
  // - GET /api/v1/permissions returns all permissions
  // - GET /api/v1/roles/:id/permissions returns permissions assigned to the role
  // - POST /api/v1/roles/:id/permissions with { permission_id } assigns
  // - DELETE /api/v1/roles/:id/permissions/:permissionId removes assignment

  const load = async () => {
    if (!role.id) return
    setLoading(true)
    try {
      const [allRes, assignedRes] = await Promise.all([
        fetch("http://localhost:3001/api/v1/permissions"),
        fetch(`http://localhost:3001/api/v1/roles/${role.id}/permissions`),
      ])

      if (!allRes.ok) throw new Error(`HTTP ${allRes.status}`)
      const allData = await allRes.json()
      const allList: Permission[] = Array.isArray(allData.msg) ? allData.msg : []
      setPermissions(allList)

      if (assignedRes.ok) {
        const assignedData = await assignedRes.json()
        const assignedList: Permission[] = Array.isArray(assignedData.msg) ? assignedData.msg : []
        const map: Record<number, boolean> = {}
        assignedList.forEach((p) => { if (p.id != null) map[Number(p.id)] = true })
        setAssigned(map)
      } else {
        // if no endpoint, start with empty map
        setAssigned({})
      }
    } catch (err) {
      console.error(err)
      toast.error("Error cargando permisos")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggle = async (permId?: number) => {
    if (!role.id || permId == null) return
    const pid = Number(permId)
    const currently = !!assigned[pid]
    setSavingIds((s) => ({ ...s, [pid]: true }))
    try {
      if (!currently) {
        // assign
        const res = await fetch(`http://localhost:3001/api/v1/roles/${role.id}/permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission_id: pid }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setAssigned((s) => ({ ...s, [pid]: true }))
        toast.success("Permiso asignado")
      } else {
        // remove - assume DELETE endpoint exists
        const res = await fetch(`http://localhost:3001/api/v1/roles/${role.id}/permissions/${pid}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setAssigned((s) => { const copy = { ...s }; delete copy[pid]; return copy })
        toast.success("Permiso removido")
      }
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error actualizando permiso: ${maybe.message || String(err)}`)
    } finally {
      setSavingIds((s) => ({ ...s, [pid]: false }))
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>Permisos</Button>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Permisos para {role.name}</DrawerTitle>
            <DrawerDescription>Marque los permisos para asignarlos o desasignarlos del rol</DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            {loading && <div className="text-sm text-muted-foreground">Cargando permisos...</div>}
            {!loading && permissions && (
              <div className="flex flex-col gap-2">
                {permissions.map((p) => (
                  <label key={p.id} className="flex items-center gap-3">
                    <Checkbox checked={!!(p.id && assigned[p.id])} disabled={!!(p.id && savingIds[p.id])} onCheckedChange={() => toggle(p.id)} />
                    <div className="flex-1">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter>
            <div className="w-full flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default function RolesPage() {
  const refetchRef = React.useRef<() => Promise<void>>(async () => Promise.resolve())

  type ColumnLocal = { key: string; label: string; sortable?: boolean; cell: (r: Role) => React.ReactNode }

  const columns = React.useMemo<ColumnLocal[]>(() => {
    return [
      { key: "id", label: "ID", sortable: true, cell: (r: Role) => r.id ?? "-" },
      { key: "name", label: "Nombre", sortable: true, cell: (r: Role) => r.name ?? "-" },
      { key: "description", label: "Descripción", cell: (r: Role) => r.description ?? "" },
      { key: "actions", label: "", cell: (r: Role) => (
        <div className="flex items-center gap-2">
          <EditRoleDrawer role={r} refetch={() => refetchRef.current()} />
          <ManageRolePermissionsDrawer role={r} />
        </div>
      ) },
    ]
  }, [])

  return (
    <AdminList<Role>
      title="Roles"
      description="Administración de roles"
      fetchUrl="http://localhost:3001/api/v1/roles"
  columns={columns}
      renderCreateDrawer={({ open, onOpenChange, onCreated }) => (
        <CreateRoleDrawer open={open} onOpenChange={onOpenChange} onCreated={onCreated} />
      )}
      onRefetchReady={(fn) => { refetchRef.current = fn }}
    />
  )
}
