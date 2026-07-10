import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/Header/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
