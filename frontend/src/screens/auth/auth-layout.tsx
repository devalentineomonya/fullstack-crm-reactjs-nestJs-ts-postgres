import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/ui/icons";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <section className="flex justify-center items-center h-screen">
      <div className="max-w-xs mx-auto size-full flex flex-col items-center h-full justify-center">
        <div className="flex flex-col text-center w-full">
          <div style={{ opacity: 1, willChange: "auto", transform: "none" }}>
            <div className="flex justify-center items-center">
              <Link to="/" className="flex items-center justify-center">
                <Logo className="bg-foreground" />
              </Link>
            </div>
            <h1 className="text-2xl text-center mt-4">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </section>
  );
};
