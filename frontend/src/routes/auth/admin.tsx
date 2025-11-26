import { AdminSignInForm } from "@/screens/auth/admin-signin-form";
import { AuthLayout } from "@/screens/auth/auth-layout";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/auth/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout
      title="Admin Login"
      description="Sign in to access the admin dashboard"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="step2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <AdminSignInForm />
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
