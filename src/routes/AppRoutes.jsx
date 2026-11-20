import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import NavBar from "../components/NavBar";
import PrincipalPage from "../pages/Principal/PrincipalPage";
import PerfilPage from "../pages/Perfil/PerfilPage";
import CurriculosPage from "../pages/Curriculos/CurriculosPage";
import VagasPage from "../pages/Vagas/VagasPage";
import ErrorPage from "../pages/Error/ErrorPage";

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