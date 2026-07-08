import { createBrowserRouter } from "react-router";
import App from "@/App";
import { CalendarPage } from "@/pages/CalendarPage";

import Index from "@/pages/Index/Index";
import Signup from "@/pages/Signup/Signup";
import Login from "@/pages/Login/Login";

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Index },
      {
        path: "users",
        children: [
          { path: "signup", Component: Signup },
          { path: "login", Component: Login },
        ],
      },
      {
        id: "calendar",
        path: "/calendar",
        Component: CalendarPage,
      },
    ],
  },
]);
