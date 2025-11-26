import { pbDataTable as DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createFileRoute } from "@tanstack/react-router";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetTickets } from "@/services/tickets/use-get-tickets";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
  AlertCircle,
  CheckCircle,
  CircleSlash,
  Clock,
  MoreHorizontal,
  Plus,
  User,
  UserCog,
} from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

export const Route = createFileRoute(
  "/dashboard/_layout/(admin)/admin/tickets"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: tickets, isLoading } = useGetTickets();

  const [search] = useQueryState("search", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [priority] = useQueryState(
    "priority",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [createdStart] = useQueryState(
    "created_start",
    parseAsString.withDefault("")
  );
  const [createdEnd] = useQueryState(
    "created_end",
    parseAsString.withDefault("")
  );
  const [resolvedStart] = useQueryState(
    "resolved_start",
    parseAsString.withDefault("")
  );
  const [resolvedEnd] = useQueryState(
    "resolved_end",
    parseAsString.withDefault("")
  );

  const filteredData = useMemo(() => {
    return tickets?.data.filter((ticket) => {
      const matchesSearch =
        search === "" ||
        ticket.issue.toLowerCase().includes(search.toLowerCase()) ||
        ticket.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.assigned_admin?.email
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status.length === 0 || status.includes(ticket.ticket_status);
      const matchesPriority =
        priority.length === 0 || priority.includes(ticket.priority_level);

      let matchesCreatedDate = true;
      if (createdStart || createdEnd) {
        const createdDate = new Date(ticket.created_date);
        const startDate = createdStart ? new Date(createdStart) : null;
        const endDate = createdEnd ? new Date(createdEnd) : null;

        if (startDate && createdDate < startDate) matchesCreatedDate = false;
        if (endDate && createdDate > endDate) matchesCreatedDate = false;
      }

      let matchesResolvedDate = true;
      if (resolvedStart || resolvedEnd) {
        const resolvedDate = ticket.resolved_date
          ? new Date(ticket.resolved_date)
          : null;
        if (!resolvedDate) return false;

        const startDate = resolvedStart ? new Date(resolvedStart) : null;
        const endDate = resolvedEnd ? new Date(resolvedEnd) : null;

        if (startDate && resolvedDate < startDate) matchesResolvedDate = false;
        if (endDate && resolvedDate > endDate) matchesResolvedDate = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCreatedDate &&
        matchesResolvedDate
      );
    });
  }, [
    search,
    status,
    priority,
    createdStart,
    createdEnd,
    resolvedStart,
    resolvedEnd,
  ]);

  const columns = useMemo<ColumnDef<CreateTicketDto>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        accessorKey: "ticket_id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs max-w-[120px] truncate">
            {row.getValue("ticket_id")}
          </div>
        ),

      },
      {
        accessorKey: "issue",
        header: "Issue",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">{row.getValue("issue")}</div>
        ),
        meta: {
          label: "Issue",
          placeholder: "Search issues...",
          variant: "text",
        },
        enableColumnFilter: true,
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
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </div>
            </div>
          );
        },

      },
      {
        accessorKey: "assigned_admin",
        header: "Assigned To",
        cell: ({ row }) => {
          const admin = row.original.assigned_admin;
          return admin ? (
            <div className="flex items-center">
              <UserCog className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">
                  {admin?.first_name} {admin?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {admin?.email}
                </div>
              </div>
            </div>
          ) : (
            <Badge variant="secondary">Unassigned</Badge>
          );
        },

      },
      {
        accessorKey: "ticket_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("ticket_status") as
            | "open"
            | "in-progress"
            | "closed";

          const variantMap = {
            open: "secondary",
            "in-progress": "info",
            closed: "success",
          };

          const iconMap = {
            open: <Clock className="h-4 w-4 mr-1" />,
            "in-progress": <AlertCircle className="h-4 w-4 mr-1" />,
            closed: <CheckCircle className="h-4 w-4 mr-1" />,
          };

          return (
            <Badge variant={variantMap[status]}>
              {iconMap[status]}
              {status === "in-progress"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Open", value: "open" },
            { label: "In Progress", value: "in-progress" },
            { label: "Closed", value: "closed" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "priority_level",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority_level") as
            | "low"
            | "medium"
            | "high";

          const variantMap = {
            low: "success",
            medium: "warning",
            high: "destructive",
          };

          return (
            <Badge variant={variantMap[priority]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          );
        },
        meta: {
          label: "Priority",
          variant: "multiSelect",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "created_date",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm">
            {format(
              new Date(row.getValue("created_date")),
              "MMM dd, yyyy HH:mm"
            )}
          </div>
        ),
        meta: {
          label: "Created Date",
          variant: "date",
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "resolved_date",
        header: "Resolved",
        cell: ({ row }) => {
          const date = row.getValue("resolved_date");
          return date ? (
            <div className="text-sm">
              {format(new Date(date), "MMM dd, yyyy HH:mm")}
            </div>
          ) : (
            <Badge variant="secondary">
              <CircleSlash className="h-4 w-4 mr-1" />
              Pending
            </Badge>
          );
        },
        meta: {
          label: "Resolved Date",
          variant: "date",
        },
        enableColumnFilter: true,
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
              <DropdownMenuItem>Edit Ticket</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              {row.original.ticket_status !== "closed" && (
                <DropdownMenuItem>Assign to Me</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 40,
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredData || [],
    columns,
    pageCount: Math.ceil((tickets?.data.length || 0) / 10),
    initialState: {
      sorting: [{ id: "created_date", desc: true }],
    },
    getRowId: (row) => row.ticket_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={columns.length}
          rowCount={10}
          filterCount={5}
          optionsCount={2}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "120px",
            "200px",
            "180px",
            "180px",
            "120px",
            "100px",
            "140px",
            "140px",
            "40px",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="my-6">
        <Button className="max-w-56" variant="primary">
          <Plus />
          Create Ticket
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
          <DataTableFilterList table={table} />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}
