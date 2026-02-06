import {
  IconListDetails,
  IconTrendingUp,
  IconChecklist,
  IconCash,
  IconCreditCard,
  IconUsers,
  IconReport,
  IconLockAccess,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import { routeTitles } from "@/config/route-titles";

export const navMain = [
  { title: routeTitles["/admin"], url: "/admin", icon: IconLayoutDashboard },
  { title: routeTitles["/admin/products"], url: "/admin/products", icon: IconListDetails },
  { title: routeTitles["/admin/inventory"], url: "/admin/inventory", icon: IconTrendingUp },
  { title: routeTitles["/admin/production"], url: "/admin/production", icon: IconChecklist },
  { title: routeTitles["/admin/purchases"], url: "/admin/purchases", icon: IconCash },
  { title: routeTitles["/admin/sales"], url: "/admin/sales", icon: IconCreditCard },
  { title: routeTitles["/admin/users"], url: "/admin/users", icon: IconUsers },
  { title: routeTitles["/admin/reports"], url: "/admin/reports", icon: IconReport },
  { title: routeTitles["/admin/security"], url: "/admin/security", icon: IconLockAccess },
];

export default navMain;
