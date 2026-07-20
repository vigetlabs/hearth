import { createBrowserRouter } from "react-router";
import App from "@/App";

import { authLoader } from "@/routes/loaders/authLoader";
import { redirectAuthenticatedUserLoader } from "@/routes/loaders/redirectAuthenticatedUserLoader";

import OfficePickerPage from "@/pages/OfficePickerPage/OfficePickerPage";
import SchedulePickerPage from "@/pages/SchedulePickerPage/SchedulePickerPage";
import SigninPage from "@/pages/SigninPage/SigninPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import CalendarPage from "@/pages/CalendarPage/CalendarPage";
import RemotePage from "@/pages/RemotePage/RemotePage";
import SandboxPage from "@/pages/SandboxPage/SandboxPage";

const devRoutes = import.meta.env.DEV
  ? [{ path: "sandbox", Component: SandboxPage }]
  : [];

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: SigninPage,
        loader: redirectAuthenticatedUserLoader,
      },
      ...devRoutes,
      {
        path: "users",
        children: [
          { path: "office", Component: OfficePickerPage },
          { path: "schedule", Component: SchedulePickerPage },
          { path: "profile", Component: ProfilePage, loader: authLoader },
        ],
      },
      {
        path: "calendar",
        children: [{ index: true, Component: CalendarPage }],
      },
      {
        path: "remote",
        Component: RemotePage,
      },
    ],
  },
]);
