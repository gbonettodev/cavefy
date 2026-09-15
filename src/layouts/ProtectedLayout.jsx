import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  Home,
  ListMusic,
  LogOut,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import { initials, mediaUrl } from "../services/media";
import { useCavefyStore } from "../store/index";
import logo from "../assets/cavefy-logo.png";
import ProfileMenu from "../components/ProfileMenu";
import Player from "../components/Player";
export default function ProtectedLayout() {
  const usuario = useCavefyStore((state) => state.usuario);
  const sair = useCavefyStore((state) => state.sair);
  const musicaAtual = useCavefyStore((state) => state.musicaAtual);
  const fila = useCavefyStore((state) => state.fila);
  const [mobileNav, setMobileNav] = useState(false);
  const library = useLibrary();
  const { playlists } = library;

  function logout() {
    sair();
  }
  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="Logo CAVEFY" />
          <span>CAVEFY</span>
        </div>
        <button
          className="mobile-close"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileNav(false)}
        >
          <X size={19} />
        </button>
        <nav className="main-nav">
          <NavLink to="/dashboard" onClick={() => setMobileNav(false)}>
            <Home size={18} /> Início
          </NavLink>
          <NavLink to="/musicas" onClick={() => setMobileNav(false)}>
            <Search size={18} /> Explorar
          </NavLink>
        </nav>
        <div className="library-heading">
          <span>Sua biblioteca</span>
          <NavLink to="/musicas/novo" title="Adicionar música">
            <Plus size={17} />
          </NavLink>
        </div>
        <nav className="library-nav">
          <NavLink to="/playlists">
            <ListMusic size={17} /> Playlists
          </NavLink>
          <NavLink to="/musicas">
            <Disc3 size={17} /> Suas músicas
          </NavLink>
        </nav>
        <div className="sidebar-playlists">
          {playlists.slice(0, 5).map((playlist) => (
            <NavLink to={`/playlists/${playlist.id}`} key={playlist.id}>
              <span className="playlist-dot" />
              {playlist.nome}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar small">
              {usuario.foto_url ? (
                <img src={mediaUrl(usuario.foto_url)} alt="Foto de perfil" />
              ) : (
                initials(usuario.nome)
              )}
            </div>
            <div>
              <strong>{usuario.nome}</strong>
              <small>
                {usuario.papel === "administrador" ? "Administrador" : "Ouvinte"}
              </small>
            </div>
          </div>
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut size={17} /> Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileNav(true)}
          >
            <Menu size={20} />
          </button>
          <div className="history-buttons">
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => window.history.back()}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              aria-label="Avançar"
              onClick={() => window.history.forward()}
            >
              <ChevronRight size={19} />
            </button>
          </div>
          <div className="topbar-actions">
            <ProfileMenu usuario={usuario} onLogout={logout} />
          </div>
        </header>
        <div className="page-scroll">
          <Outlet context={library} />
        </div>
      </main>
      {musicaAtual && (
        <Player musica={musicaAtual} fila={fila} onSelect={library.tocar} />
      )}
    </div>
  );
}
