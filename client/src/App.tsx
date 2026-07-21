import "@/App.css";

import Layout from "@/components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* # subriber wrapper */}
      <Layout>
        <Outlet />
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
