import { Outlet, useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../../services/auth'
import { usePerfil } from '../../hooks/usePerfil'
import Navbar from './Navbar'
import UserMenu from './UserMenu'
import './MainLayout.css'

function MainLayout() {
  const navigate = useNavigate()
  const { perfil } = usePerfil()

  if (!isAuthenticated()) {
    navigate('/login')
    return null
  }

  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-content">
          <Navbar />
          <UserMenu perfil={perfil} />
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
