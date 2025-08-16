import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router";

import App from "./App.tsx";
import MechanicDashboard from "./dashboards/MechanicDashboard.tsx";
import TeamLeaderDashboard from "./dashboards/TeamLeaderDashboard.tsx";
import Registration from "./auth/Registration.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/mechanicdashboard",
    element: <MechanicDashboard />,
  },
  {
    path: "/teamleaderdashboard",
    element: <TeamLeaderDashboard />,
  },
  {
    path: "/registration",
    element: <Registration />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
