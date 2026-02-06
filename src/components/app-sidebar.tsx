import * as React from "react"
import { IconCamera, IconFileAi, IconFileDescription, IconHelp, IconSearch, IconSettings } from "@tabler/icons-react"

import logo from "@/assets/logo.png";
import { navMain } from "@/config/nav-main";
import { useAuthContext } from "@/hooks/use-auth-context";

//import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Oscar Terceros",
    email: "osterce@egmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
    // navMain is now imported from config/nav-main
    navMain,
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Ajustes",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Obtener ayuda",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  /* documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ], */
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useAuthContext();

  // build the user object for NavUser: prefer profile values when available
  const capitalize = (s?: string) => {
    if (!s) return undefined;
    const str = String(s).trim();
    if (str.length === 0) return undefined;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getRoleLabel = (raw?: number | string) => {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === "number") {
      switch (raw) {
        case 1:
          return "Admin";
        case 2:
          return "User";
        default:
          return `Role ${raw}`;
      }
    }
    // if it's already a string, normalize capitalization
    if (typeof raw === "string") return capitalize(raw);
    return undefined;
  };

  const userFromProfile = profile
    ? {
  name: capitalize((profile.name as string) || (profile.email as string) || "Usuario") ?? "Usuario",
        // Try several common fields that might contain role info
        role: (() => {
          const p = profile as unknown as Record<string, unknown>;
          const roleRaw = (p["role_id"] ?? p["role"] ?? p["roleId"]) as number | string | undefined;
          return getRoleLabel(roleRaw);
        })(),
        email: (profile.email as string) || "usuario@ejemplo.com",
        avatar: "/avatars/shadcn.jpg",
      }
    : undefined;

  const user = userFromProfile ?? {
    name: "Usuario",
    role: "User",
    email: "usuario@ejemplo.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5! overflow-visible"
              >
                <div className="flex items-center justify-center mt-6 gap-3 overflow-visible p-1">
                  <img src={logo} alt="Textiles logo" className="w-12 h-12 object-contain" />
                  <span className="font-semibold font-inspiration text-5xl leading-none">Textiles</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
