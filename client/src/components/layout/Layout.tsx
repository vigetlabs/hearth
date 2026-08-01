import AppAuthProvider from "@/contexts/AppAuthProvider";
import Header from "@/components/Header/Header";
import { useLocation } from "react-router";

interface LayoutProps {
  children: React.ReactNode;
}

const SHOW_HEADER_PATHS = ["/calendar", "/users/profile", "/remote"];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const showHeader = SHOW_HEADER_PATHS.includes(pathname);

  return (
    <AppAuthProvider>
      <div className="flex min-h-screen flex-col">
        {showHeader && <Header />}
        {children}
      </div>
    </AppAuthProvider>
  );
}
