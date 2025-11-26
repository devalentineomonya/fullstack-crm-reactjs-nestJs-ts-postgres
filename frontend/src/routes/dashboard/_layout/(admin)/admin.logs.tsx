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
import { useGetAdminActivityLogs } from "@/services/admin-logs/use-get-admin-logs";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
  Activity,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Terminal,
} from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/dashboard/_layout/(admin)/admin/logs")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: logs, isLoading, refetch } = useGetAdminActivityLogs();

  const [search] = useQueryState("search", parseAsString.withDefault(""));
  const [actionType] = useQueryState(
    "action_type",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [targetEntity] = useQueryState(
    "target_entity",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [dateStart] = useQueryState(
    "date_start",
    parseAsString.withDefault("")
  );
  const [dateEnd] = useQueryState("date_end", parseAsString.withDefault(""));

  const filteredData = useMemo(() => {
    return logs?.data.filter((log) => {
      const matchesSearch =
        search === "" ||
        log.action_type.toLowerCase().includes(search.toLowerCase()) ||
        log.action_details?.toLowerCase().includes(search.toLowerCase()) ||
        log.admin?.email?.toLowerCase().includes(search.toLowerCase()) ||
        log.ip_address.toLowerCase().includes(search.toLowerCase()) ||
        (log.target_entity &&
          log.target_entity.toLowerCase().includes(search.toLowerCase()));

      const matchesActionType =
        actionType.length === 0 || actionType.includes(log.action_type);
      const matchesTargetEntity =
        targetEntity.length === 0 ||
        (log.target_entity && targetEntity.includes(log.target_entity));

      let matchesDateRange = true;
      if (dateStart || dateEnd) {
        const logDate = new Date(log.action_time);
        const startDate = dateStart ? new Date(dateStart) : null;
        const endDate = dateEnd ? new Date(dateEnd) : null;

        if (startDate && logDate < startDate) matchesDateRange = false;
        if (endDate && logDate > endDate) matchesDateRange = false;
      }

      return (
        matchesSearch &&
        matchesActionType &&
        matchesTargetEntity &&
        matchesDateRange
      );
    });
  }, [search, actionType, targetEntity, dateStart, dateEnd]);

  const actionTypeColors: Record<string, string> = {
    create: "success",
    update: "info",
    delete: "destructive",
    login: "secondary",
    logout: "secondary",
    permission_change: "warning",
    system: "outline",
    other: "outline",
  };

  const columns = useMemo<ColumnDef<AdminActivityLog>[]>(
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
        accessorKey: "action_time",
        header: "Time",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {format(new Date(row.getValue("action_time")), "MMM dd, yyyy")}
            <div className="text-xs text-muted-foreground">
              {format(new Date(row.getValue("action_time")), "HH:mm:ss")}
            </div>
          </div>
        ),
        meta: {
          label: "Time",
          variant: "date",
        },
      },
      {
        accessorKey: "admin",
        header: "Admin",
        cell: ({ row }) => {
          const admin = row.original.admin;
          return admin ? (
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">
                  {admin.first_name} {admin.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {admin.email}
                </div>
              </div>
            </div>
          ) : (
            <Badge variant="destructive">System</Badge>
          );
        },
        meta: {
          label: "Admin",
          placeholder: "Search admins...",
          variant: "text",
        },
      },
      {
        accessorKey: "action_type",
        header: "Action",
        cell: ({ row }) => {
          const actionType = row.getValue("action_type") as string;
          return (
            <Badge variant={actionTypeColors[actionType] || "outline"}>
              <Activity className="h-4 w-4 mr-1" />
              {actionType
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Badge>
          );
        },
        meta: {
          label: "Action Type",
          variant: "multiSelect",
          options: [
            { label: "Create", value: "create" },
            { label: "Update", value: "update" },
            { label: "Delete", value: "delete" },
            { label: "Login", value: "login" },
            { label: "Logout", value: "logout" },
            { label: "Permission Change", value: "permission_change" },
            { label: "System", value: "system" },
            { label: "Other", value: "other" },
          ],
        },
      },
      {
        accessorKey: "action_details",
        header: "Details",
        cell: ({ row }) => {
          const details = row.getValue("action_details") as string;
          return details ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate text-sm">{details}</div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <pre className="whitespace-pre-wrap break-words">{details}</pre>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge variant="outline">No details</Badge>
          );
        },
        meta: {
          label: "Details",
          placeholder: "Search details...",
          variant: "text",
        },
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => {
          const log = row.original;
          return log.target_entity ? (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium capitalize">
                  {log.target_entity}
                </div>
                {log.target_id && (
                  <div className="text-xs text-muted-foreground">
                    ID: {log.target_id}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Badge variant="secondary">N/A</Badge>
          );
        },
        meta: {
          label: "Target Entity",
          variant: "multiSelect",
          options: [
            { label: "User", value: "user" },
            { label: "Profile", value: "profile" },
            { label: "Ticket", value: "ticket" },
            { label: "Quote", value: "quote" },
            { label: "Admin", value: "admin" },
          ],
        },
      },
      {
        accessorKey: "ip_address",
        header: "IP Address",
        cell: ({ row }) => {
          const ip = row.getValue("ip_address") as string;
          return (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{ip}</span>
                <Button
                  value={ip}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                />
              </div>
            </div>
          );
        },
        meta: {
          label: "IP Address",
          placeholder: "Search IPs...",
          variant: "text",
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
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Terminal className="h-4 w-4 mr-2" />
                View Raw Data
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
    pageCount: Math.ceil((logs?.data.length || 0) / 20),
    initialState: {
      sorting: [{ id: "action_time", desc: true }],
    },
    getRowId: (row) => row.log_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={columns.length}
          rowCount={20}
          filterCount={4}
          optionsCount={3}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "120px",
            "180px",
            "120px",
            "200px",
            "140px",
            "180px",
            "40px",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="my-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Activity Logs</h1>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Logs
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
