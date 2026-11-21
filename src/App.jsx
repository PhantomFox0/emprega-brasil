import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Curriculo from './pages/Curriculo'
import Vagas from './pages/Vagas'
import Perfil from './pages/Perfil'

function App() {
  // Guarda qual página está aberta agora
  const [pagina, setPagina] = useState('inicio')

  function mudarPagina(novaPagina) {
    setPagina(novaPagina)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <Header mudarPagina={mudarPagina} />

      <main>
        {pagina === 'inicio' && <Home mudarPagina={mudarPagina} />}
        {pagina === 'curriculo' && <Curriculo />}
        {pagina === 'vagas' && <Vagas />}
        {pagina === 'perfil' && <Perfil />}
      </main>

      <Footer mudarPagina={mudarPagina} />
    </>
  )
}

export default App
