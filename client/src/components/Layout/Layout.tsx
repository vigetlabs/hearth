import AuthProvider from "@/components/AuthProvider/AuthProvider";
import OfficeProvider from "@/components/OfficeProvider/OfficeProvider";
import Header from "@/components/Header/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <OfficeProvider>
        <Header />
        {children}
      </OfficeProvider>
    </AuthProvider>
  );
}
