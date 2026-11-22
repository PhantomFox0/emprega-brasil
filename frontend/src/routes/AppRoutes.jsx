import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Curriculo from "../pages/Curriculo";
import Vagas from "../pages/Vagas";
import Perfil from "../pages/Perfil";
import Cadastro from "../pages/Cadastro"; // [AJUSTE 1] Importa a nova página Cadastro
import Error from "../pages/Error";

function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

// [AJUSTE 2] Componente wrapper para ligar os callbacks de navegação da página Cadastro
function CadastroRoute() {
  const navigate = useNavigate();

  function handleSucesso(perfilCriado) {
    // Redireciona para /perfil levando o ID recém-criado no state da navegação
    navigate("/perfil", {
      state: { perfilId: perfilCriado?.id },
    });
  }

  function handleIrParaPerfil() {
    navigate("/perfil");
  }

  return (
    <Cadastro
      onSucesso={handleSucesso}
      onIrParaPerfil={handleIrParaPerfil}
    />
  );
}

// [AJUSTE 3] Componente wrapper para resolver perfilId (URL param, state ou padrão 1) e ligar o botão "Novo cadastro"
function PerfilRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Prioridade: ID na URL (/perfil/:id) -> ID enviado após cadastro (location.state) -> perfil padrão 1
  const perfilId = Number(id) || Number(location.state?.perfilId) || 1;

  function handleIrParaCadastro() {
    navigate("/cadastro");
  }

  return (
    <Perfil
      perfilId={perfilId}
      onIrParaCadastro={handleIrParaCadastro}
    />
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "curriculo",
        element: <Curriculo />,
      },
      {
        path: "vagas",
        element: <Vagas />,
      },
      {
        path: "cadastro", // [AJUSTE 4] Nova rota filha para a página de Cadastro
        element: <CadastroRoute />,
      },
      {
        path: "perfil", // [AJUSTE 5] Rota principal de Perfil usando PerfilRoute
        element: <PerfilRoute />,
      },
      {
        path: "perfil/:id", // [AJUSTE 6] Rota dinâmica opcional para abrir um perfil específico por ID
        element: <PerfilRoute />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;