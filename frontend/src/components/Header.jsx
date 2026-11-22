import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Logo from "./Logo";
import NavBar from "./NavBar";
import AuthActions from "./AuthActions";
import "../stylesheet/Header.css";

function Header() {
  const { pathname } = useLocation();
  const [visivel, setVisivel] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  // Ao navegar para outra rota o menu fecha (ajuste de estado durante a renderização, sem useEffect).
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    setMenuAberto(false);
  }
  const ultimoScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      // Com o menu aberto, o topo fica fixo para não sumir debaixo do dedo.
      if (menuAberto) return;

      const atualScrollY = window.scrollY;
      const diferenca = atualScrollY - ultimoScrollY.current;

      if (Math.abs(diferenca) < 8) return;

      if (atualScrollY <= 50) {
        setVisivel(true);
      } else if (diferenca > 0) {
        setVisivel(false);
      } else {
        setVisivel(true);
      }

      ultimoScrollY.current = atualScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuAberto]);

  useEffect(() => {
    if (!menuAberto) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuAberto(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuAberto]);

  const classes = ["header"];
  if (!visivel && !menuAberto) classes.push("header--escondido");
  if (menuAberto) classes.push("header--aberto");

  return (
    <header className={classes.join(" ")}>
      <Logo />

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={menuAberto}
        aria-controls="menu-principal"
        onClick={() => setMenuAberto((aberto) => !aberto)}
      >
        {menuAberto ? "Fechar" : "Menu"}
      </button>

      <div id="menu-principal" className="header-painel">
        <NavBar className="menu" />
        <AuthActions />
      </div>
    </header>
  );
}

export default Header;
