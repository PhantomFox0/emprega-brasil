import { Outlet } from "react-router-dom"
import NavBar from "./components/NavBar"

function App() {

  return (
    <>
      <NavBar />
      <h1> React Router </h1>
      <Outlet />
      <p>Footer</p>
    </>
  )
}

export default App
