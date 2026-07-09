import { createBrowserRouter } from "react-router";
import App from "@/App";

import { authLoader } from "@/routes/loaders/authLoader";

import IndexPage from "@/pages/IndexPage/IndexPage";
import SignupPage from "@/pages/SignupPage/SignupPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import CalendarPage from "@/pages/CalendarPage/CalendarPage";

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: App,
    children: [
      { index: true, Component: IndexPage },
      {
        path: "users",
        children: [
          { path: "signup", Component: SignupPage },
          { path: "login", Component: LoginPage },
          { path: "profile", Component: ProfilePage, loader: authLoader },
        ],
      },
      {
        path: "calendar",
        children: [{ index: true, Component: CalendarPage }],
      },
    ],
  },
]);
