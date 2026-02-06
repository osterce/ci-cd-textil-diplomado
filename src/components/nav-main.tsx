
import { NavLink, useLocation } from "react-router"

import type { Icon as TablerIcon } from "@tabler/icons-react"
import { IconUsers, IconShieldCheck, IconKey, IconDotsVertical } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

type NavItem = {
  title: string
  url: string
  icon?: TablerIcon
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { isMobile } = useSidebar()
  const location = useLocation()

  return (
    <SidebarGroup>
      <Separator className="my-2" />
      <SidebarGroupLabel asChild className="pt-2 pb-2">
        <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menú</div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {/* Separador superior */}
        <Separator className="my-2" />

        <SidebarMenu>
          {items.map((item) => {
            // special case: users admin item should open a dropdown with submenu
            if (item.url === "/admin/users") {
              const isUsersActive = location.pathname === "/admin/users" || location.pathname.startsWith("/admin/users/")
              return (
                <SidebarMenuItem key={item.title}>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <button
                        className={`peer/menu-button flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                          isUsersActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted/5"
                        }`}
                      >
                        {item.icon && <item.icon size={18} />}
                        <span className="truncate">{item.title}</span>
                        <IconDotsVertical className="ml-auto" size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align="start"
                      sideOffset={4}
                    >
                        <DropdownMenuItem asChild>
                          <NavLink to="/admin/users" className="flex w-full items-center px-3 py-2">
                            <IconUsers size={16} className="mr-3 text-muted-foreground" />
                            <span>Usuarios</span>
                          </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <NavLink to="/admin/users/roles" className="flex w-full items-center px-3 py-2">
                            <IconShieldCheck size={16} className="mr-3 text-muted-foreground" />
                            <span>Roles</span>
                          </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <NavLink to="/admin/users/permissions" className="flex w-full items-center px-3 py-2">
                            <IconKey size={16} className="mr-3 text-muted-foreground" />
                            <span>Permisos</span>
                          </NavLink>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/admin"}
                  className={({ isActive }) =>
                    `peer/menu-button flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/5"
                    }`
                  }
                >
                  {item.icon && <item.icon size={18} />}
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* Separador inferior */}
        <Separator className="my-2" />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavMain
