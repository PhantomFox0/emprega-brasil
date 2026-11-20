import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PrincipalPage from "./pages/Principal/PrincipalPage";
import PerfilPage from "./pages/Perfil/PerfilPage";
import CurriculosPage from "./pages/Curriculos/CurriculosPage";
import VagasPage from "./pages/Vagas/VagasPage";
import ErrorPage from "./pages/Error/ErrorPage.jsx";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <PrincipalPage />,
//   },
//   {
//     path: "perfil",
//     element: <PerfilPage />,
//   },
//   {
//     path: "curriculos",
//     element: <CurriculosPage />,
//   },
//   {
//     path: "vagas",
//     element: <VagasPage />,
//   },
// ]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
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
    ]
  },

]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
