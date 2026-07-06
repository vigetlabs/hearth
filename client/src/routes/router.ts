import { createBrowserRouter } from 'react-router';
import App from '@/App';

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: App
  }
])
