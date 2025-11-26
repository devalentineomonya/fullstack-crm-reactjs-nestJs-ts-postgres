import type { ColumnDef } from "@tanstack/react-table";
import { User, UserCog, UserCheck, UserX, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const userColumns: ColumnDef<UserWithCounts>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div>
          {user.first_name} {user.last_name}
        </div>
      );
    },
    meta: {
      label: "Name",
      placeholder: "Search names...",
      variant: "text",
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate">
        {row.getValue("email")}
      </div>
    ),
    meta: {
      label: "Email",
      placeholder: "Search emails...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
    cell: ({ row }) => {
      const user = row.original;
      return <div>{user.phone_number}</div>;
    },
    meta: {
      label: "Phone Number",
      placeholder: "Search phone number...",
      variant: "text",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "pending"
        | "active"
        | "inactive";

      const variantMap: Record<
        "pending" | "active" | "inactive",
        "secondary" | "success" | "destructive"
      > = {
        pending: "secondary",
        active: "success",
        inactive: "destructive",
      };

      const iconMap = {
        pending: <User className="h-4 w-4 mr-1" />,
        active: <UserCheck className="h-4 w-4 mr-1" />,
        inactive: <UserX className="h-4 w-4 mr-1" />,
      };

      return (
        <Badge variant={variantMap[status]}>
          {iconMap[status]}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: "email_verified",
    header: "Email Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("email_verified") as boolean;

      return (
        <Badge variant={isVerified ? "success" : "destructive"}>
          {isVerified ? (
            <>
              <UserCheck className="h-4 w-4 mr-1" />
              Verified
            </>
          ) : (
            <>
              <UserX className="h-4 w-4 mr-1" />
              Not Verified
            </>
          )}
        </Badge>
      );
    },

    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: "account_type",
    header: "Account Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        <UserCog className="h-4 w-4 mr-1" />
        {row.getValue("account_type")}
      </Badge>
    ),
    meta: {
      label: "Account Type",
      variant: "multiSelect",
      options: [
        { label: "Free", value: "free" },
        { label: "Premium", value: "premium" },
      ],
    },
  },
  {
    accessorKey: "quotes_count",
    header: "Quotations",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("quotes_count")}
      </div>
    ),
    meta: {
      label: "Quotations",
      variant: "range",
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      return rowValue >= value.min && rowValue <= value.max;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "tickets_count",
    header: "Tickets",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("tickets_count")}
      </div>
    ),
    meta: {
      label: "Ticket",
      variant: "range",
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      return rowValue >= value.min && rowValue <= value.max;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "visits_count",
    header: "Visits",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("visits_count")}
      </div>
    ),
    meta: {
      label: "Visits",
      variant: "range",
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      return rowValue >= value.min && rowValue <= value.max;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "registration_date",
    header: "Registered",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.getValue("registration_date")), "MMM dd, yyyy")}
      </div>
    ),
    meta: {
      label: "Registration Date",
      variant: "date",
    },
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id));
      return rowDate >= value.start && rowDate <= value.end;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "last_login",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("last_login")
        ? format(new Date(row.getValue("last_login")), "MMM dd, yyyy")
        : "Never";
      return <div className="text-sm">{date}</div>;
    },
    meta: {
      label: "Last Login",
      variant: "date",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Profile</DropdownMenuItem>
          <DropdownMenuItem>Edit User</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    size: 40,
  },
];
