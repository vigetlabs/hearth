import { createBrowserRouter } from "react-router";
import App from "@/App";
import { CalendarPage } from "@/pages/CalendarPage";

import { authLoader } from "@/routes/loaders/authLoader";

import Index from "@/pages/Index/Index";
import Signup from "@/pages/Signup/Signup";
import Login from "@/pages/Login/Login";
import ProfilePage from "@/pages/Profile/ProfilePage";

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
          { path: "profile", Component: ProfilePage, loader: authLoader },
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
