import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import NavBar from "../components/NavBar";
import PrincipalPage from "../pages/PrincipalPage";
import PerfilPage from "../pages/PerfilPage";
import CurriculosPage from "../pages/CurriculosPage";
import VagasPage from "../pages/VagasPage";
import ErrorPage from "../pages/ErrorPage";

function RootLayout() {
  return (
    <>
      <NavBar />
      <h1>React Router</h1>
      <Outlet />
      <p>Footer</p>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <PrincipalPage />,
      },
      {
        path: "perfil",
        element: <PerfilPage />,
      },
      {
        path: "curriculos",
        element: <CurriculosPage />,
      },
      {
        path: "vagas",
        element: <VagasPage />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;