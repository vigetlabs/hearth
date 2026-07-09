import AuthProvider from "@/components/AuthProvider/AuthProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
