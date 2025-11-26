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
import { useGetProfiles } from "@/services/profiles/use-get-profiles";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
} from "nuqs";
import {
  Globe,
  MapPin,
  Cake,
  User,
  Mail,
  MoreHorizontal,
  Link as LinkIcon,
} from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

export const Route = createFileRoute("/dashboard/_layout/(admin)/admin/profiles")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: profiles, isLoading } = useGetProfiles();

  const [search] = useQueryState("search", parseAsString.withDefault(""));
  const [language] = useQueryState(
    "language",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [country] = useQueryState(
    "country",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [dobStart] = useQueryState("dob_start", parseAsString.withDefault(""));
  const [dobEnd] = useQueryState("dob_end", parseAsString.withDefault(""));

  const filteredData = useMemo(() => {
    return profiles?.data.filter((profile) => {
      const matchesSearch =
        search === "" ||
        (profile.user?.email?.toLowerCase().includes(search.toLowerCase())) ||
        (profile.user?.first_name?.toLowerCase().includes(search.toLowerCase())) ||
        (profile.user?.last_name?.toLowerCase().includes(search.toLowerCase())) ||
        (profile.address?.toLowerCase().includes(search.toLowerCase())) ||
        (profile.city?.toLowerCase().includes(search.toLowerCase()));

      const matchesLanguage = language.length === 0 || language.includes(profile.preferred_language);
      const matchesCountry = country.length === 0 || (profile.country && country.includes(profile.country));

      let matchesDob = true;
      if (dobStart || dobEnd) {
        const dobDate = profile.date_of_birth ? new Date(profile.date_of_birth) : null;
        if (!dobDate) return false;

        const startDate = dobStart ? new Date(dobStart) : null;
        const endDate = dobEnd ? new Date(dobEnd) : null;

        if (startDate && dobDate < startDate) matchesDob = false;
        if (endDate && dobDate > endDate) matchesDob = false;
      }

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesCountry &&
        matchesDob
      );
    });
  }, [search, language, country, dobStart, dobEnd]);

  const columns = useMemo<ColumnDef<Profile>[]>(
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
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original.user;
          return user ? (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> {user.email}
                </div>
              </div>
            </div>
          ) : (
            <Badge variant="destructive">No User</Badge>
          );
        },
        meta: {
          label: "User",
          placeholder: "Search users...",
          variant: "text",
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const profile = row.original;
          return (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                {profile.address && (
                  <div className="truncate">{profile.address}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  {profile.zip_code && ` (${profile.zip_code})`}
                </div>
              </div>
            </div>
          );
        },
        meta: {
          label: "Location",
          placeholder: "Search locations...",
          variant: "text",
        },
      },
      {
        accessorKey: "preferred_language",
        header: "Language",
        cell: ({ row }) => {
          const language = row.getValue("preferred_language") as string;
          const languageMap: Record<string, string> = {
            en: "English",
            es: "Spanish",
            fr: "French",
            de: "German",
            sw: "Swahili",
            other: "Other",
          };

          return (
            <Badge variant="outline">
              <Globe className="h-4 w-4 mr-1" />
              {languageMap[language] || language}
            </Badge>
          );
        },
        meta: {
          label: "Language",
          variant: "multiSelect",
          options: [
            { label: "English", value: "en" },
            { label: "Spanish", value: "es" },
            { label: "French", value: "fr" },
            { label: "German", value: "de" },
            { label: "Swahili", value: "sw" },
            { label: "Other", value: "other" },
          ],
        },
      },
      {
        accessorKey: "date_of_birth",
        header: "Date of Birth",
        cell: ({ row }) => {
          const dob = row.getValue("date_of_birth") as string | null;
          return dob ? (
            <div className="flex items-center">
              <Cake className="h-4 w-4 mr-2" />
              <div className="text-sm">
                {format(new Date(dob), "MMM dd, yyyy")}
              </div>
            </div>
          ) : (
            <Badge variant="secondary">Not provided</Badge>
          );
        },
        meta: {
          label: "Date of Birth",
          variant: "date",
        },
      },
      {
        accessorKey: "social_media_links",
        header: "Social Links",
        cell: ({ row }) => {
          const links = row.getValue("social_media_links") as string[] | null;
          return links?.length ? (
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2" />
              <Badge variant="secondary">{links.length} links</Badge>
            </div>
          ) : (
            <Badge variant="outline">None</Badge>
          );
        },
        meta: {
          label: "Has Social Links",
          variant: "boolean",
        },
        filterFn: (row, id, value) => {
          const links = row.getValue(id) as string[];
          return value ? links?.length > 0 : !links || links.length === 0;
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
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>Update User</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete Profile
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
    pageCount: Math.ceil((profiles?.data.length || 0) / 10),
    initialState: {
      sorting: [{ id: "user", desc: false }],
    },
    getRowId: (row) => row.profile_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={columns.length}
          rowCount={10}
          filterCount={4}
          optionsCount={2}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "200px",
            "220px",
            "120px",
            "120px",
            "100px",
            "40px",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
          <DataTableFilterList table={table} />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}

