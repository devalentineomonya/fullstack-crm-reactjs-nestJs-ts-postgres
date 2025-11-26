import type { ColumnDef } from "@tanstack/react-table";
import {
  User,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  CalendarCheck,
  FileText,
} from "lucide-react";
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

export const quoteColumns: ColumnDef<Quote>[] = [
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
    accessorKey: "quote_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs truncate max-w-[120px]">
        {row.getValue("quote_id")}
      </div>
    ),
    meta: {
      label: "ID",
      placeholder: "Search IDs...",
      variant: "text",
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      );
    },
    meta: {
      label: "User",
      placeholder: "Search users...",
      variant: "text",
    },
  },
  {
    accessorKey: "quote_details",
    header: "Details",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("quote_details")}
      </div>
    ),
    meta: {
      label: "Details",
      placeholder: "Search details...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "pending"
        | "approved"
        | "rejected"
        | "expired";

      const variantMap = {
        pending: "secondary",
        approved: "success",
        rejected: "destructive",
        expired: "outline",
      };

      const iconMap = {
        pending: <Clock className="h-4 w-4 mr-1" />,
        approved: <CheckCircle className="h-4 w-4 mr-1" />,
        rejected: <XCircle className="h-4 w-4 mr-1" />,
        expired: <CalendarCheck className="h-4 w-4 mr-1" />,
      };

      return (
        <Badge
          variant={
            variantMap[status] as
              | "secondary"
              | "success"
              | "destructive"
              | "outline"
          }
        >
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
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Expired", value: "expired" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "estimated_cost",
    header: "Estimated Cost",
    cell: ({ row }) => {
      const cost = row.getValue("estimated_cost") as number;
      return cost ? (
        <div className="font-medium">
          $
          {cost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    meta: {
      label: "Estimated Cost",
      variant: "range",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "requested_date",
    header: "Requested",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.getValue("requested_date")), "MMM dd, yyyy")}
      </div>
    ),
    meta: {
      label: "Requested Date",
      variant: "date",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "valid_until",
    header: "Valid Until",
    cell: ({ row }) => {
      const date = row.getValue("valid_until") as Date;
      return date ? (
        <div className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    meta: {
      label: "Valid Until",
      variant: "date",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "quote_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("quote_type") || "N/A"}</Badge>
    ),
  },
  {
    accessorKey: "attachments",
    header: "Attachments",
    cell: ({ row }) => {
      const attachments = row.getValue("attachments") as string[];
      return (
        <Badge variant={attachments?.length ? "secondary" : "outline"}>
          <FileText className="h-4 w-4 mr-1" />
          {attachments?.length || 0}
        </Badge>
      );
    },
    meta: {
      label: "Has Attachments",
      variant: "boolean",
    },
    filterFn: (row, id, value) => {
      const attachments = row.getValue(id) as string[];
      return value
        ? attachments?.length > 0
        : !attachments || attachments.length === 0;
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
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Quote</DropdownMenuItem>
          <DropdownMenuItem>Change Status</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    size: 40,
  },
];
