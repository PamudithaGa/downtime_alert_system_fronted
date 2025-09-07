import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import App from "./App.tsx";
import MechanicDashboard from "./dashboards/MechanicDashboard.tsx";
import TeamLeaderDashboard from "./dashboards/TeamLeaderDashboard.tsx";
import Registration from "./auth/Registration.tsx";
import TabletDashboard from "./dashboards/TabletDashboard.tsx";
import AdminDashboard from "./dashboards/AdminDashboard.tsx";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/mechanicdashboard",
    element: (
      <ProtectedRoute allowedRoles={["mechanic"]}>
        <MechanicDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tvdashboard",
    element: <TeamLeaderDashboard />,
  },
  {
    path: "/registration",
    element: <Registration />,
  },

  {
    path: "/tabletdashboard",
    element: (
      <ProtectedRoute allowedRoles={["Team Leader"]}>
        <TabletDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
