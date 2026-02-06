import * as React from "react"
import AdminList from "@/components/admin/admin-list"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit } from "@tabler/icons-react"
import { toast } from "sonner"

type Permission = { id?: number; name?: string; description?: string }

function CreatePermissionDrawer({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (p: Permission) => void }) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", description: "" })

  const submit = async () => {
    if (!form.name.trim()) return toast.error("El nombre es obligatorio")
    setSaving(true)
    try {
      const res = await fetch("http://localhost:3001/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const created = (data && data.msg && typeof data.msg === "object") ? data.msg : ({} as Permission)
      onCreated(created as Permission)
      onOpenChange(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error creando permiso: ${maybe.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Crear permiso</DrawerTitle>
          <DrawerDescription>Define un nuevo permiso</DrawerDescription>
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

function EditPermissionDrawer({ permission, refetch }: { permission: Permission; refetch?: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: permission.name ?? "", description: permission.description ?? "" })

  React.useEffect(() => {
    if (open) setForm({ name: permission.name ?? "", description: permission.description ?? "" })
  }, [open, permission])

  const save = async () => {
    if (!permission.id) return
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:3001/api/v1/permissions/${permission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      if (refetch) await refetch()
      toast.success("Permiso actualizado")
      setOpen(false)
    } catch (err) {
      const maybe = err as { message?: string }
      toast.error(`Error actualizando permiso: ${maybe.message || String(err)}`)
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
            <DrawerTitle>Editar permiso</DrawerTitle>
            <DrawerDescription>Actualizar información del permiso</DrawerDescription>
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

export default function PermissionsPage() {
  const refetchRef = React.useRef<() => Promise<void>>(async () => Promise.resolve())

  type ColumnLocal = { key: string; label: string; sortable?: boolean; cell: (p: Permission) => React.ReactNode }

  const columns = React.useMemo<ColumnLocal[]>(() => [
    { key: "id", label: "ID", sortable: true, cell: (p: Permission) => p.id ?? "-" },
    { key: "name", label: "Nombre", sortable: true, cell: (p: Permission) => p.name ?? "-" },
    { key: "description", label: "Descripción", cell: (p: Permission) => p.description ?? "" },
    { key: "actions", label: "", cell: (p: Permission) => <EditPermissionDrawer permission={p} refetch={() => refetchRef.current()} /> },
  ], [])

  return (
    <AdminList<Permission>
      title="Permisos"
      description="Administración de permisos"
      fetchUrl="http://localhost:3001/api/v1/permissions"
      columns={columns}
      renderCreateDrawer={({ open, onOpenChange, onCreated }) => (
        <CreatePermissionDrawer open={open} onOpenChange={onOpenChange} onCreated={onCreated} />
      )}
      onRefetchReady={(fn) => { refetchRef.current = fn }}
    />
  )
}

