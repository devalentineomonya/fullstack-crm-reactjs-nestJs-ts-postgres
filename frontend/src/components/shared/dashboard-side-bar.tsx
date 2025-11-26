import { sidebarItems } from "@/lib/sidebar-items";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = ({
  className,
  isExpanded,
}: {
  className?: string;
  isExpanded: boolean;
}) => {
  return (
    <aside
      className={`sticky top-16 flex flex-col justify-between ${
        className || ""
      }`}
    >
      <nav>
        <ul className="flex flex-col space-y-1">
          {sidebarItems.map((sidebarItem) => (
            <li key={sidebarItem.path} className="w-full px-2 cursor-pointer">
              {isExpanded ? (
                <Link to={sidebarItem.path}>
                  <Button variant={"ghost"} className="w-full justify-start">
                    {<sidebarItem.icon className="h-5 w-5" />}
                    <span className="ml-2">{sidebarItem.label}</span>
                  </Button>
                </Link>
              ) : (

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={sidebarItem.path}>
                        <Button
                          variant={"ghost"}

                          className="w-full justify-center"
                        >
                          <sidebarItem.icon  className="h-8 w-8" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {sidebarItem.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <footer className="pt-2 pb-1 border-t">
        {isExpanded ? (
          <Button variant={"ghost"} className="w-full justify-start">
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        ) : (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"ghost"} className="w-full justify-center">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </footer>
    </aside>
  );
};
