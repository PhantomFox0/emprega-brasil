import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CurriculoPage from './pages/CurriculoPage'
import VagasPage from './pages/VagasPage'
import PerfilPage from './pages/PerfilPage'

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
        {pagina === 'inicio' && <HomePage mudarPagina={mudarPagina} />}
        {pagina === 'curriculo' && <CurriculoPage />}
        {pagina === 'vagas' && <VagasPage />}
        {pagina === 'perfil' && <PerfilPage />}
      </main>

      <Footer mudarPagina={mudarPagina} />
    </>
  )
}

export default App
