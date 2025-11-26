import { pbDataTable as DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createFileRoute } from "@tanstack/react-router";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Button } from "@/components/ui/button";
import { userColumns } from "@/screens/admin/user-columns";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetUsers } from "@/services/users/use-get-users";

import { useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";
import { Plus } from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

export const Route = createFileRoute("/dashboard/_layout/(admin)/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: users, isLoading } = useGetUsers();

  const [title] = useQueryState("title", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [emailVerified] = useQueryState(
    "email_verified",
    parseAsArrayOf(parseAsBoolean).withDefault([])
  );
  const [accountType] = useQueryState(
    "account_type",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [quotationMin] = useQueryState(
    "quotation_min",
    parseAsInteger.withDefault(0)
  );
  const [quotationMax] = useQueryState(
    "quotation_max",
    parseAsInteger.withDefault(100)
  );
  const [regStart] = useQueryState("reg_start", parseAsString.withDefault(""));
  const [regEnd] = useQueryState("reg_end", parseAsString.withDefault(""));

  const filteredData = useMemo(() => {
    return users?.data.filter((user) => {
      const matchesTitle =
        title === "" ||
        user.first_name.toLowerCase().includes(title.toLowerCase()) ||
        user.last_name.toLowerCase().includes(title.toLowerCase()) ||
        user.email.toLowerCase().includes(title.toLowerCase());

      const matchesStatus = status.length === 0 || status.includes(user.status);

      const matchesAccountType =
        accountType.length === 0 || accountType.includes(user.account_type);

      const matchesQuotation =
        (quotationMin === undefined || user.quotes_count >= quotationMin) &&
        (quotationMax === undefined || user.quotes_count <= quotationMax);

      let matchesRegDate = true;
      if (regStart || regEnd) {
        const userRegDate = new Date(user.registration_date);
        const startDate = regStart ? new Date(regStart) : null;
        const endDate = regEnd ? new Date(regEnd) : null;

        if (startDate && userRegDate < startDate) matchesRegDate = false;
        if (endDate && userRegDate > endDate) matchesRegDate = false;
      }

      const matchesEmailVerified =
        emailVerified.length === 0 ||
        emailVerified.includes(user.email_verified);

      return (
        matchesTitle &&
        matchesStatus &&
        matchesAccountType &&
        matchesQuotation &&
        matchesRegDate &&
        matchesEmailVerified
      );
    });
  }, [
    title,
    status,
    accountType,
    quotationMin,
    quotationMax,
    regStart,
    regEnd,
    emailVerified,
  ]);

  const { table } = useDataTable({
    data: filteredData || [],
    columns: userColumns,
    pageCount: Math.ceil((users?.count || 0) / 10),
    initialState: {
      sorting: [{ id: "registration_date", desc: true }],
    },
    getRowId: (row) => row.user_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={userColumns.length}
          rowCount={10}
          filterCount={6}
          optionsCount={3}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "200px",
            "200px",
            "150px",
            "120px",
            "120px",
            "120px",
            "100px",
            "100px",
            "100px",
            "120px",
            "120px",
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
          Add User
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
