import { usePerfil } from '../hooks/usePerfil'
import PerfilHeader from '../components/perfil/PerfilHeader'
import PerfilInfo from '../components/perfil/PerfilInfo'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Perfil.css'

function Perfil() {
  const { perfil, loading, error, refetch } = usePerfil()

  if (loading) {
    return (
      <div className="perfil-page">
        <PerfilHeader />
        <div className="perfil-loading">
          <LoadingSpinner />
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="perfil-page">
        <PerfilHeader />
        <div className="perfil-error">
          <p>Error al cargar el perfil: {error}</p>
          <button onClick={refetch} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="perfil-page">
      <PerfilHeader />
      <PerfilInfo perfil={perfil} />
    </div>
  )
}

export default Perfil
