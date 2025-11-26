import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  FileWarning,
  Minus,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/_layout/(admin)/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const stats = [
    { label: "Users", icon: Users, value: 2548, trend: 12.3, positive: true },
    {
      label: "Quotation",
      icon: BadgeDollarSign,
      value: 42,
      trend: -3.1,
      positive: false,
    },
    { label: "Tickets", icon: FileWarning, value: 18, trend: 0, positive: null },
    {
      label: "Total Funds",
      icon: BadgeDollarSign,
      value: 125460,
      trend: 8.7,
      positive: true,
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <DashboardStatsCard
            key={index}
            label={stat.label}
            icon={stat.icon}
            value={stat.value}
            trend={stat.trend}
            positive={stat.positive}
          />
        ))}
      </div>
    </div>
  );
}

const DashboardStatsCard = ({
  label,
  icon: Icon,
  value,
  trend,
  positive,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  trend: number;
  positive: boolean | null;
}) => {
  const formattedValue =
    value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  const trendColor =
    positive === true
      ? "text-green-500"
      : positive === false
      ? "text-red-500"
      : "text-gray-500";

  const TrendIcon =
    positive === true ? ArrowUp : positive === false ? ArrowDown : Minus;

  return (
    <Card className="w-full bg-background hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row justify-between items-start pb-2 space-y-0">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <h1 className="text-2xl font-bold">{formattedValue}</h1>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center text-sm">
          <span className={`flex items-center mr-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground">
            {positive === true
              ? "increase"
              : positive === false
              ? "decrease"
              : "no change"}{" "}
            from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
