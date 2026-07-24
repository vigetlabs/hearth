import { createBrowserRouter } from "react-router";
import App from "@/App";

import { onboardingLoader } from "@/routes/loaders/onboardingLoader";
import { officePickerLoader } from "@/routes/loaders/officePickerLoader";
import { schedulePickerLoader } from "@/routes/loaders/schedulePickerLoader";

import OfficePickerPage from "@/pages/OfficePickerPage/OfficePickerPage";
import SchedulePickerPage from "@/pages/SchedulePickerPage/SchedulePickerPage";
import SigninPage from "@/pages/SigninPage/SigninPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import CalendarPage from "@/pages/CalendarPage/CalendarPage";
import RemotePage from "@/pages/RemotePage/RemotePage";
import SandboxPage from "@/pages/SandboxPage/SandboxPage";
import { signinLoader } from "@/routes/loaders/signinLoader";

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
        loader: signinLoader,
      },
      ...devRoutes,
      {
        path: "users",
        children: [
          {
            path: "office",
            Component: OfficePickerPage,
            loader: officePickerLoader,
          },
          {
            path: "schedule",
            Component: SchedulePickerPage,
            loader: schedulePickerLoader,
          },
          { path: "profile", Component: ProfilePage, loader: onboardingLoader },
        ],
      },
      {
        path: "calendar",
        children: [
          {
            index: true,
            Component: CalendarPage,
            loader: onboardingLoader,
          },
        ],
      },
      {
        path: "remote",
        Component: RemotePage,
        loader: onboardingLoader,
      },
    ],
  },
]);
