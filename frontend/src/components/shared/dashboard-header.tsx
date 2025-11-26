import { Logo } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const DashboardHeader = ({ className }: { className?: string }) => {
  return (
    <header className={cn("p-4 sticky top-0 z-10 bg-background shadow", className)}>
      <div className="flex items-center gap-2">
        <Logo />
        <span className="font-grotesk text-xl font-bold">Nexus</span>
      </div>
    </header>
  );
};
