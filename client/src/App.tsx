import '@/App.css'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { getHealth } from '@/util/api/health'

const queryClient = new QueryClient()

function HealthCheck() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  if (isLoading) return <div>Checking API...</div>
  if (isError) return <div>API is down</div>
  if (!data) return <div>No API status returned</div>


  return <div>API status: {data.status}</div>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="text-error">Hello, World!</div>
      <HealthCheck />
    </QueryClientProvider>
  )
}

export default App
