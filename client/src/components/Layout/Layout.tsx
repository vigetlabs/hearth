import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/Header/Header";
import { useLocation } from "react-router";

interface LayoutProps {
  children: React.ReactNode;
}

const HIDE_HEADER_PATHS = ["/users/office", "/users/schedule"];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const showHeader = !HIDE_HEADER_PATHS.includes(pathname);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        {showHeader && <Header />}
        {children}
      </div>
    </AuthProvider>
  );
}
