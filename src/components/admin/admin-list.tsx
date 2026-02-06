import * as React from "react"
import { IconX, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
//import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Drawers rendered by parent via renderCreateDrawer; no drawer primitives needed here
import { Input } from "@/components/ui/input"
// note: Radix select and Checkbox not used here (kept in parent forms/drawers)

type Column<T> = {
  key: string
  label: string
  sortable?: boolean
  cell: (item: T) => React.ReactNode
}

type AdminListProps<T> = {
  title: string
  description?: string
  fetchUrl: string
  rolesUrl?: string
  columns: Column<T>[]
  // render a create drawer; parent provides the drawer component so it can contain its own fields and API calls
  renderCreateDrawer: (props: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (item: T) => void }) => React.ReactNode
  // optional function to map role_id -> label when rolesMap is loaded
  getRoleLabel?: (role_id?: number) => string
}

const defaultGetRoleLabel = (raw?: number | string) => {
  if (raw === undefined || raw === null) return "-"
  if (typeof raw === "string") return raw.charAt(0).toUpperCase() + raw.slice(1)
  if (typeof raw === "number") return String(raw)
  return "-"
}

export default function AdminList<T extends { id?: number }>(props: AdminListProps<T> & { onRefetchReady?: (refetch: () => Promise<void>) => void }) {
  const { title, description, fetchUrl, rolesUrl, columns, renderCreateDrawer, getRoleLabel = defaultGetRoleLabel } = props

  const [items, setItems] = React.useState<T[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [rolesMap, setRolesMap] = React.useState<Record<number, string>>({})
  const [query, setQuery] = React.useState("")
  // field is the column key to filter by; 'all' means global
  const [field, setField] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string | null>("id")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [createOpen, setCreateOpen] = React.useState(false)

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }

  const fetchItems = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const res = await fetch(fetchUrl, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const list: T[] = Array.isArray(data.msg) ? data.msg : []
      setItems(list)
    } catch (err) {
      const maybe = err as { name?: string; message?: string }
      if (maybe.name === "AbortError") return
      setError(maybe.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [fetchUrl])

  React.useEffect(() => {
    const ac = new AbortController()
    fetchItems(ac.signal)
    return () => ac.abort()
  }, [fetchItems])

  // expose refetch to parent if requested
  React.useEffect(() => {
    props.onRefetchReady?.(() => fetchItems())
  }, [fetchItems, props])

  React.useEffect(() => {
    if (!rolesUrl) return
    const ac = new AbortController()
    const loadRoles = async () => {
      try {
        const res = await fetch(rolesUrl, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data.msg) ? data.msg : []
        const map = list.reduce((acc: Record<number, string>, r: unknown) => {
          const rr = r as Record<string, unknown>
          const id = Number(rr.id)
          const rawName = rr.name ?? ""
          const name = typeof rawName === "string" ? rawName : String(rawName)
          acc[id] = name.charAt(0).toUpperCase() + name.slice(1)
          return acc
        }, {} as Record<number, string>)
        setRolesMap(map)
      } catch (err) {
        const maybe = err as { name?: string }
        if (maybe.name === "AbortError") return
        console.error("Failed to load roles:", err)
      }
    }
    loadRoles()
    return () => ac.abort()
  }, [rolesUrl])

  const displayed = React.useMemo(() => {
    if (!items) return []
    const q = query.trim().toLowerCase()

    const parseActive = (s: string) => {
      const v = s.trim().toLowerCase()
      if (["1", "true", "si", "yes", "activo"].includes(v)) return true
      if (["0", "false", "no", "inactivo"].includes(v)) return false
      return null
    }

    type ItemWithCommon = T & { name?: string; email?: string; role_id?: number; isActive?: boolean }

    let list = items.filter((u) => {
      const item = u as ItemWithCommon
      if (!q) return true
      // try common fields; roleLabel is handy for role-like columns
      const roleLabel = (item.role_id && rolesMap[item.role_id]) ?? getRoleLabel(item.role_id)

      if (field === "all") {
        return (
          String(item.name || "").toLowerCase().includes(q) ||
          String(item.email || "").toLowerCase().includes(q) ||
          String(roleLabel || "").toLowerCase().includes(q)
        )
      }

      // boolean 'isActive' special-case: allow searching by active/inactive words
      if (field === "isActive") {
        const parsed = parseActive(q)
        if (parsed === null) return false
        return !!item.isActive === parsed
      }

      // role field special-case: compare against resolved role label
      if (field === "role") {
        return String(roleLabel || "").toLowerCase().includes(q)
      }

      // generic field: stringify the property from the item
      const val = (item as unknown as Record<string, unknown>)[field]
      return String(val ?? "").toLowerCase().includes(q)
    })

    if (sortBy) {
      list = [...list].sort((a, b) => {
        const aa = a as ItemWithCommon
        const bb = b as ItemWithCommon
        let av: string | number | undefined = undefined
        let bv: string | number | undefined = undefined
        switch (sortBy) {
          case "name":
            av = aa.name || ""
            bv = bb.name || ""
            break
          case "email":
            av = aa.email || ""
            bv = bb.email || ""
            break
          case "id":
            av = aa.id ?? 0
            bv = bb.id ?? 0
            break
          case "role":
            av = (aa.role_id && rolesMap[aa.role_id]) ?? getRoleLabel(aa.role_id)
            bv = (bb.role_id && rolesMap[bb.role_id]) ?? getRoleLabel(bb.role_id)
            break
          case "isActive":
            av = aa.isActive ? 1 : 0
            bv = bb.isActive ? 1 : 0
            break
          default:
            av = String((aa as unknown as Record<string, unknown>)[sortBy] ?? "")
            bv = String((bb as unknown as Record<string, unknown>)[sortBy] ?? "")
        }

        const aComp = typeof av === "number" ? av : String(av ?? "").toLowerCase()
        const bComp = typeof bv === "number" ? bv : String(bv ?? "").toLowerCase()

        if (typeof aComp === "number" && typeof bComp === "number") {
          if (aComp < bComp) return sortDir === "asc" ? -1 : 1
          if (aComp > bComp) return sortDir === "asc" ? 1 : -1
          return 0
        }

        const s1 = String(aComp)
        const s2 = String(bComp)
        const cmp = s1.localeCompare(s2)
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return list
  }, [items, query, rolesMap, sortBy, sortDir, field, getRoleLabel])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

      <Separator className="my-4" />

      {/* Search & create area */}
      <div className="px-6 py-4">
        <div className="max-w-4xl flex items-center gap-3">
          <div className="flex-1 max-w-lg">
            {field === "isActive" ? (
              <Select value={query} onValueChange={(v) => setQuery(v)}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Seleccione Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={"Buscar por nombre, email o rol..."}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPageIndex(0) }}
                className="w-full"
              />
            )}
          </div>

          <div className="w-56">
            <Select value={field} onValueChange={(v) => { setField(v); setQuery(""); setPageIndex(0) }}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* dynamic filter options driven from columns prop */}
                <SelectItem value="all">Todos</SelectItem>
                {columns.filter(c => c.key !== 'actions').map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {query && (
            <Button variant="ghost" size="icon" onClick={() => { setQuery(""); setPageIndex(0) }} aria-label="Clear search">
              <IconX />
            </Button>
          )}

          <div className="ml-auto">
            <Button size="sm" onClick={() => setCreateOpen(true)}>Crear nuevo</Button>
          </div>
        </div>
      </div>

      {renderCreateDrawer({ open: createOpen, onOpenChange: setCreateOpen, onCreated: async (i: T) => {
        // if created item looks empty, refetch fallback
  const created = i as Partial<T>
  const createdRec = created as unknown as Record<string, unknown>
  const isEmpty = created.id == null && !createdRec.email
        if (isEmpty) {
          await fetchItems()
          toast.success("Creado con éxito")
          return
        }
        setItems((prev) => prev ? [i, ...prev] : [i])
        toast.success("Creado con éxito")
      }})}

      {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}
      {error && <div className="text-sm text-destructive">Error: {error}</div>}

      {!loading && items && (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>
                      {col.sortable ? (
                        <button className="flex items-center gap-2" onClick={() => toggleSort(col.key)}>
                          {col.label}
                          {sortBy === col.key ? (sortDir === "asc" ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />) : null}
                        </button>
                      ) : (
                        col.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const total = displayed.length
                  const pageCount = Math.max(1, Math.ceil(total / pageSize))
                  const currentPage = Math.min(pageIndex, pageCount - 1)
                  const start = currentPage * pageSize
                  const end = start + pageSize
                  const pageItems = displayed.slice(start, end)

                  return pageItems.map((u, __idx) => {
                    const rowKey = (u.id != null) ? `id-${u.id}` : `item-${__idx}`
                    return (
                      <TableRow key={rowKey}>
                        {columns.map((col) => (
                          <TableCell key={`${rowKey}-${col.key}`}>{col.cell(u)}</TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                })()}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 mt-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Filas por página</Label>
              <Select value={`${pageSize}`} onValueChange={(val) => { const n = Number(val); setPageSize(n); setPageIndex(0) }}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={`${pageSize}`} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5,10,20,50].map((s) => (<SelectItem key={s} value={`${s}`}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm text-muted-foreground hidden sm:block">
                {(() => { const total = items.length; const pageCount = Math.max(1, Math.ceil(total / pageSize)); return `Página ${Math.min(pageIndex, pageCount - 1) + 1} de ${pageCount}` })()}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}><IconChevronsLeft /></Button>
                <Button variant="outline" size="icon" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}><IconChevronLeft /></Button>
                <Button variant="outline" size="icon" onClick={() => { const total = items.length; const pageCount = Math.max(1, Math.ceil(total / pageSize)); setPageIndex((p) => Math.min(pageCount - 1, p + 1)) }} disabled={(() => { const total = items.length; const pageCount = Math.max(1, Math.ceil(total / pageSize)); return pageIndex >= pageCount - 1 })()}><IconChevronRight /></Button>
                <Button variant="outline" size="icon" onClick={() => { const total = items.length; const pageCount = Math.max(1, Math.ceil(total / pageSize)); setPageIndex(pageCount - 1) }} disabled={(() => { const total = items.length; const pageCount = Math.max(1, Math.ceil(total / pageSize)); return pageIndex >= pageCount - 1 })()}><IconChevronsRight /></Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
