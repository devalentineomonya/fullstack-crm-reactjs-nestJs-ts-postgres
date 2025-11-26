import { DashboardHeader } from "@/components/shared/dashboard-header";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/shared/dashboard-side-bar";
import { useIsMobile } from "@/hooks/use-ismobile";

export const Route = createFileRoute("/dashboard/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader className="sticky top-0 border-b shadow z-10" />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            className={`sticky top-16 pt-6 h-[calc(100dvh-66px)] border-r transition-all duration-300 ${
              sidebarOpen ? "w-[250px]" : "w-20"
            }`}
            isExpanded={sidebarOpen}
          />
        )}

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[250px]">
            <Sidebar className="h-full pt-4" isExpanded={true} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto p-4 relative">
          <div className="sticky top-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="gap-2"
            >
              <PanelLeft className="h-4 w-4" />
              <span>
                {isMobile ? "Menu" : sidebarOpen ? "Collapse" : "Expand"}
              </span>
            </Button>
          </div>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
