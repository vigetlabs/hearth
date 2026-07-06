import '@/App.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='text-error'>Hello, World!</div>
    </QueryClientProvider>
  )
}

export default App
