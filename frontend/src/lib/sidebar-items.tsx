import {
  ChartPie,
  BadgeDollarSign,
  FileWarning,
  Users2,
  User,
  Cog,
  File,
  ChartSpline,
  UserCog,
  ScrollText,
  MapPinned,
} from "lucide-react";

export const sidebarItems = [
  {
    path: "/dashboard/admin",
    label: "Dashboard",
    icon: ChartPie,
  },
  {
    path: "/dashboard/admin/quotations",
    label: "Quotations",
    icon: BadgeDollarSign,
  },
  {
    path: "/dashboard/admin/tickets",
    label: "Tickets",
    icon: FileWarning,
  },
  {
    path: "/dashboard/admin/users",
    label: "Users",
    icon: Users2,
  },
  {
    path: "/dashboard/admin/profiles",
    label: "Profiles",
    icon: UserCog,
  },
  {
    path: "/dashboard/admin/logs",
    label: "Logs",
    icon: ScrollText,
  },
  {
    path: "/dashboard/admin/visits",
    label: "Visits",
    icon: MapPinned,
  },
  {
    path: "/dashboard/admin/reports",
    label: "Reports",
    icon: File,
  },
  {
    path: "/dashboard/admin/metrics",
    label: "Metrics",
    icon: ChartSpline,
  },
  {
    path: "/dashboard/admin/profile",
    label: "Profile",
    icon: User,
  },
  {
    path: "/dashboard/admin/settings",
    label: "Settings",
    icon: Cog,
  },
];
