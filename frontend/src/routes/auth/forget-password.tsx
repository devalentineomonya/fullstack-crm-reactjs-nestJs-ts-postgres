import { ResetPasswordForm } from "@/screens/auth/auth-forget-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/forget-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ResetPasswordForm />;
}
