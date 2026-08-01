import { useContext } from "react";
import { AppAuthContext } from "@/contexts/AppAuthContext";

export function useAuth() {
  const context = useContext(AppAuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
