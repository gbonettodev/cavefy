import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { initials, mediaUrl, primeiroNome } from "../services/media";

export default function Header({ usuario, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const nome = primeiroNome(usuario.nome);

  function abrirPerfil() {
    setOpen(false);
    navigate("/perfil");
  }

  function sair() {
    setOpen(false);
    onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="profile-menu">
      <button
        className="top-profile"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <div className="avatar">
          {usuario.foto_url ? (
            <img src={mediaUrl(usuario.foto_url)} alt="Foto de perfil" />
          ) : (
            initials(nome)
          )}
        </div>
        <span>{nome}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-user">
            <strong>{nome}</strong>
            <small>{usuario.email}</small>
          </div>
          <button type="button" onClick={abrirPerfil}>
            <UserRound size={16} /> Informações do perfil
          </button>
          <button type="button" onClick={sair}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
