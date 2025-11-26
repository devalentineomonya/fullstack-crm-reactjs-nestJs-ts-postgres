import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/providers/theme-provider";
import { TableDataProvider } from "@/providers/nuq-provider";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

// Create a client

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TableDataProvider>
          <Outlet />
        </TableDataProvider>
        <TanStackRouterDevtools />
      </QueryClientProvider>
      <Toaster richColors position="top-center"/>
    </ThemeProvider>
  ),
});
