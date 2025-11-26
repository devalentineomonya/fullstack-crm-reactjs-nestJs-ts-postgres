import { pbDataTable as DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { createFileRoute } from "@tanstack/react-router";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetQuotes } from "@/services/quotes/use-get-quotes";

import { useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
  parseAsInteger,
} from "nuqs";
import { Plus } from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { quoteColumns } from "@/screens/admin/quote-column";

export const Route = createFileRoute(
  "/dashboard/_layout/(admin)/admin/quotations"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: quotes, isLoading } = useGetQuotes();

  const [search] = useQueryState("search", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [type] = useQueryState(
    "type",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [costMin] = useQueryState("cost_min", parseAsInteger.withDefault(0));
  const [costMax] = useQueryState(
    "cost_max",
    parseAsInteger.withDefault(100000)
  );
  const [requestedStart] = useQueryState(
    "requested_start",
    parseAsString.withDefault("")
  );
  const [requestedEnd] = useQueryState(
    "requested_end",
    parseAsString.withDefault("")
  );
  const [validStart] = useQueryState(
    "valid_start",
    parseAsString.withDefault("")
  );
  const [validEnd] = useQueryState("valid_end", parseAsString.withDefault(""));

  const filteredData = useMemo(() => {
    return quotes?.data.filter((quote) => {
      const matchesSearch =
        search === "" ||
        quote.quote_details.toLowerCase().includes(search.toLowerCase()) ||
        quote.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        quote.quote_type?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status.length === 0 || status.includes(quote.status);
      const matchesType =
        type.length === 0 ||
        (quote.quote_type && type.includes(quote.quote_type));

      const matchesCost =
        (costMin === undefined || (quote.estimated_cost ?? 0) >= costMin) &&
        (costMax === undefined || (quote.estimated_cost ?? 0) <= costMax);

      let matchesRequestedDate = true;
      if (requestedStart || requestedEnd) {
        const quoteDate = new Date(quote.requested_date);
        const startDate = requestedStart ? new Date(requestedStart) : null;
        const endDate = requestedEnd ? new Date(requestedEnd) : null;

        if (startDate && quoteDate < startDate) matchesRequestedDate = false;
        if (endDate && quoteDate > endDate) matchesRequestedDate = false;
      }

      let matchesValidDate = true;
      if (validStart || validEnd) {
        const validDate = quote.valid_until
          ? new Date(quote.valid_until)
          : null;
        if (!validDate) return false;

        const startDate = validStart ? new Date(validStart) : null;
        const endDate = validEnd ? new Date(validEnd) : null;

        if (startDate && validDate < startDate) matchesValidDate = false;
        if (endDate && validDate > endDate) matchesValidDate = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesCost &&
        matchesRequestedDate &&
        matchesValidDate
      );
    });
  }, [
    search,
    status,
    type,
    costMin,
    costMax,
    requestedStart,
    requestedEnd,
    validStart,
    validEnd,
  ]);

  const { table } = useDataTable({
    data: filteredData || [],
    columns: quoteColumns,
    pageCount: Math.ceil((quotes?.count || 0) / 10),
    initialState: {
      sorting: [{ id: "requested_date", desc: true }],
    },
    getRowId: (row) => row.quote_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={quoteColumns.length}
          rowCount={10}
          filterCount={5}
          optionsCount={3}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "120px",
            "180px",
            "200px",
            "120px",
            "120px",
            "100px",
            "100px",
            "100px",
            "80px",
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
          Create Quote
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
