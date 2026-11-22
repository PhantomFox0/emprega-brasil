import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import NavBar from "./NavBar";

function Header() {
  const [visivel, setVisivel] = useState(true);
  const ultimoScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
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
  }, []);

  return (
    <header className={`header ${visivel ? "" : "header--escondido"}`}>
      <Logo />
      <NavBar className="menu" />
    </header>
  );
}

export default Header;