import { useCallback, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Home,
  ListMusic,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { apiFetch } from "../services/api";
import { initials, mediaUrl } from "../services/media";
import { useCavefyStore } from "../store/index";
import logo from "../assets/cavefy-logo.png";
import ProfileMenu from "../components/ProfileMenu";
import Player from "../components/Player";
import "../styles/layout.css";
export default function ProtectedLayout() {
  const usuario = useCavefyStore((state) => state.usuario);
  const token = useCavefyStore((state) => state.token);
  const sair = useCavefyStore((state) => state.sair);
  const tocar = useCavefyStore((state) => state.tocar);
  const musicaAtual = useCavefyStore((state) => state.musicaAtual);
  const fila = useCavefyStore((state) => state.fila);
  const [musicas, setMusicas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [songs, genres, lists] = await Promise.all([
        apiFetch("/musicas", {}, token),
        apiFetch("/generos", {}, token),
        apiFetch("/playlists", {}, token),
      ]);
      setMusicas(songs);
      setGeneros(genres);
      setPlaylists(lists);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCarregando(false);
    }
  }, [token]);
  async function salvarMusica(data, files, id) {
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") body.append(key, value);
    });
    if (files.audio?.[0]) body.append("audio", files.audio[0]);
    if (files.capa?.[0]) body.append("capa", files.capa[0]);
    const result = await apiFetch(
      id ? "/musicas/" + id : "/musicas",
      { method: id ? "PUT" : "POST", body },
      token,
    );
    setMusicas((current) =>
      id
        ? current.map((item) => (item.id === id ? result : item))
        : [result, ...current],
    );
    return result;
  }

  async function excluirMusica(id) {
    if (!window.confirm("Excluir esta música do catálogo?")) return;
    await apiFetch("/musicas/" + id, { method: "DELETE" }, token);
    setMusicas((current) => current.filter((item) => item.id !== id));
    toast.success("Música removida do catálogo.");
  }

  async function criarPlaylist(data) {
    const result = await apiFetch(
      "/playlists",
      { method: "POST", body: JSON.stringify(data) },
      token,
    );
    setPlaylists((current) => [result, ...current]);
    toast.success("Playlist criada.");
  }

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
        <button className="mobile-close" onClick={() => setMobileNav(false)}>
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
            <NavLink to="/playlists" key={playlist.id}>
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
                {usuario.papel === "administrador"
                  ? "Administrador"
                  : "Ouvinte"}
              </small>
            </div>
            <ChevronDown size={15} />
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={17} /> Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
            <Menu size={20} />
          </button>
          <div className="history-buttons">
            <button onClick={() => window.history.back()}>
              <ChevronLeft size={19} />
            </button>
            <button onClick={() => window.history.forward()}>
              <ChevronRight size={19} />
            </button>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon">
              <Settings2 size={18} />
            </button>
            <ProfileMenu usuario={usuario} onLogout={logout} />
          </div>
        </header>
        <div className="page-scroll">
          <Outlet
            context={{
              musicas,
              generos,
              playlists,
              carregando,
              salvarMusica,
              excluirMusica,
              criarPlaylist,
              tocar,
              reload: carregar,
            }}
          />
        </div>
      </main>
      {musicaAtual && <Player musica={musicaAtual} fila={fila} />}
    </div>
  );
}
